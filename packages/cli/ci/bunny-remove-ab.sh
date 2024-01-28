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
  echo "Provide the domain as the first argument"
  exit 1
fi

project_id=$1
domain=$2

if [ -z "$GIT_BRANCH" ]; then
  echo "GIT_BRANCH env not set, skipping edge rules removal"
  exit 0
fi

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

remove_edge_rule() {
  local description=$1
  local found_rule=$(echo $edge_rules | jq --arg description "$description" '.[] | select(.Description == $description)')
  local guid=$(echo $found_rule | jq -r '.Guid // empty')

  if [ -n "$guid" ]; then
    curl --silent --request DELETE \
      --url "https://api.bunny.net/pullzone/$pull_zone_id/edgerules/$guid" \
      --header "AccessKey: $BUNNYNET_API_KEY"
    echo "> Removed edge rule \"$description\""
  else
    echo "> Edge rule \"$description\" not found"
  fi
}

remove_edge_rule "A/B testing [$GIT_BRANCH]"
remove_edge_rule "A/B CDN cache bypass [$GIT_BRANCH]"
remove_edge_rule "A/B perma-cache bypass [$GIT_BRANCH]"
