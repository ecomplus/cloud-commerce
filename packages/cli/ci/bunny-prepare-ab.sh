#!/bin/bash

if [ -z "$BUNNYNET_API_KEY" ]; then
  echo "BUNNYNET_API_KEY env var must be set"
  exit 1
fi
if [ $# -eq 0 ]; then
  echo "Provide the Firebase project ID as the first argument"
  exit 1
fi
if [ $# -eq 1 ]; then
  echo "Provide the domain as the second argument"
  exit 1
fi

project_id=$1
domain=$2
channel_url=$3

base_uri=""
additional_patterns=()

fetch_and_purge() {
  local endpoint=$1
  local response=$(curl --silent "$base_uri$endpoint")
  local slugs=$(echo $response | jq -r '.result[].slug')

  for slug in $slugs; do
    if [ -n "$slug" ]; then
      additional_patterns+=("\"https://$domain/$slug\"")
    fi
  done
}

if [ -n "$ECOM_STORE_ID" ]; then
  base_uri="https://ecomplus.io/v2/:$ECOM_STORE_ID/"

  fetch_and_purge 'products?fields=slug&sort=-sales&limit=2'
  fetch_and_purge 'categories?fields=slug&sort=created_at&limit=1'
fi

if [ -z "$GIT_BRANCH" ]; then
  echo "GIT_BRANCH env not set, skipping edge rules config"
  exit 0
fi
if [ -z "$channel_url" ]; then
  echo "Channel URL not set (second argument), skipping edge rules config"
  exit 0
fi
channel_url="${channel_url%/}"

response=$(curl --silent --request GET \
  --url https://api.bunny.net/pullzone \
  --header "AccessKey: $BUNNYNET_API_KEY" \
  --header 'accept: application/json')

pull_zone_id=$(echo $response | jq --arg domain "$domain" '[.[] | select(.Hostnames[].Value | contains($domain)).Id][0]')
if [ -z "$pull_zone_id" ]; then
  echo "bunny.net pull zone not found for domain $domain"
  exit 1
fi

edge_rules=$(echo $response | jq --arg id "$pull_zone_id" '.[] | select(.Id == ($id | tonumber)).EdgeRules')

configure_edge_rule() {
  printf "\n"
  local description=$1
  local rule_data=$2
  local is_additional_patterns=${3:-true}
  local found_rule=$(echo $edge_rules | jq --arg description "$description" '.[] | select(.Description == $description)')
  local guid=$(echo $found_rule | jq -r '.Guid // empty')

  local json_data="$rule_data"
  if [ "$is_additional_patterns" = true ]; then
    local additional_patterns_json=$(printf '%s\n' "${additional_patterns[@]}" | jq -s '.')
    json_data=$(echo $json_data | jq --argjson additionalPatterns "$additional_patterns_json" '.Triggers[0].PatternMatches += $additionalPatterns')
  fi
  if [ -n "$guid" ]; then
    json_data=$(echo $json_data | jq --arg guid "$guid" '. + {Guid: $guid}')
  fi

  curl --silent --request POST \
    --url "https://api.bunny.net/pullzone/$pull_zone_id/edgerules/addOrUpdate" \
    --header "AccessKey: $BUNNYNET_API_KEY" \
    --header 'content-type: application/json' \
    --data "$json_data"
  printf "\n\n> Configured edge rule \"$description\"\n"
}

ab_testing_data="
{
  \"ActionType\": 2,
  \"ActionParameter1\": \"$channel_url\",
  \"ActionParameter2\": \"\",
  \"Triggers\": [
    {
      \"Type\": 0,
      \"PatternMatches\": [
        \"https://$domain/\"
      ],
      \"PatternMatchingType\": 0,
      \"Parameter1\": \"\"
    },
    {
      \"Type\": 7,
      \"PatternMatches\": [
        \"50\"
      ],
      \"PatternMatchingType\": 0,
      \"Parameter1\": \"\"
    }
  ],
  \"TriggerMatchingType\": 1,
  \"Description\": \"A/B testing [$GIT_BRANCH]\",
  \"Enabled\": true
}"

ab_testing_ttl_data="
{
  \"ActionType\": 3,
  \"ActionParameter1\": \"120\",
  \"ActionParameter2\": \"\",
  \"Triggers\": [
    {
      \"Type\": 0,
      \"PatternMatches\": [
        \"https://$domain/\"
      ],
      \"PatternMatchingType\": 0,
      \"Parameter1\": \"\"
    }
  ],
  \"TriggerMatchingType\": 1,
  \"Description\": \"A/B CDN short cache [$GIT_BRANCH]\",
  \"Enabled\": true
}"

ab_testing_perma_bypass_data="
{
  \"ActionType\": 15,
  \"ActionParameter1\": null,
  \"ActionParameter2\": null,
  \"Triggers\": [
    {
      \"Type\": 0,
      \"PatternMatches\": [
        \"https://$domain/\"
      ],
      \"PatternMatchingType\": 0,
      \"Parameter1\": \"\"
    }
  ],
  \"TriggerMatchingType\": 1,
  \"Description\": \"A/B perma-cache bypass [$GIT_BRANCH]\",
  \"Enabled\": true
}"

configure_edge_rule "A/B testing [$GIT_BRANCH]" "$ab_testing_data"
configure_edge_rule "A/B CDN short cache [$GIT_BRANCH]" "$ab_testing_ttl_data"
configure_edge_rule "A/B perma-cache bypass [$GIT_BRANCH]" "$ab_testing_perma_bypass_data"

curl --silent --request POST \
  --url "https://api.bunny.net/purge?url=https://$domain/" \
  --header "AccessKey: $BUNNYNET_API_KEY"
printf "\n> Purged https://$domain/ cache"

for slug_url in "${additional_patterns[@]}"; do
  clean_url=${slug_url//\"/}
  curl --silent --request POST \
    --url "https://api.bunny.net/purge?url=$clean_url" \
    --header "AccessKey: $BUNNYNET_API_KEY"
  echo "> Purged $clean_url cache"
done
