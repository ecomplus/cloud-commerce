#!/bin/bash

if [ -z "$BUNNYNET_API_KEY" ]; then
  echo "BUNNYNET_API_KEY env var must be set"
  exit 1
fi
if [ $# -eq 0 ]; then
  echo "Provide the Firebase project ID as the first argument"
  exit 1
fi

project_id=$1
domain=$2
origin_url="${3:-https://$project_id.web.app}"

storage_list=$(curl --silent --request GET \
  --url https://api.bunny.net/storagezone \
  --header "AccessKey: $BUNNYNET_API_KEY" \
  --header 'accept: application/json')

storage_prefix="storefront-isr-"
storage_id=$(echo $storage_list | jq --arg prefix "$storage_prefix" '.[] | select(.Name | startswith($prefix)) | .Id')

if [ -z "$storage_id" ]; then
  rand_suffix=$(printf "%06d" $((RANDOM % 10000000)))
  storage_name="${storage_prefix}${rand_suffix}"

  printf "\n"
  response=$(curl --silent --request POST \
    --url https://api.bunny.net/storagezone \
    --header "AccessKey: $BUNNYNET_API_KEY" \
    --header 'accept: application/json' \
    --header 'content-type: application/json' \
    --data "
{
  \"Name\": \"$storage_name\",
  \"Region\": \"DE\",
  \"ReplicationRegions\": [
    \"NY\",
    \"BR\"
  ],
  \"ZoneTier\": 1
}
")

  storage_id=$(echo "$response" | jq -r '.Id')
  printf "\n\n> Created storage zone \"$storage_name\" ($storage_id)"
fi

if [ -z "$storage_id" ]; then
  echo "Could not create bunny.net storage zone"
  exit 1
fi

get_pull_zone_id() {
  pull_zone_list=$(curl --silent --request GET \
    --url https://api.bunny.net/pullzone \
    --header "AccessKey: $BUNNYNET_API_KEY" \
    --header 'accept: application/json')

  pull_zone_id=$(echo $pull_zone_list | jq --arg url "$origin_url" '.[] | select(.OriginUrl == $url) | .Id')
}
get_pull_zone_id

if [ -z "$pull_zone_id" ]; then
  printf "\n"
  response=$(curl --silent --request POST \
    --url https://api.bunny.net/pullzone \
    --header "AccessKey: $BUNNYNET_API_KEY" \
    --header 'accept: application/json' \
    --header 'content-type: application/json' \
    --data "
{
  \"OriginUrl\": \"$origin_url\",
  \"EnableGeoZoneUS\": true,
  \"EnableGeoZoneEU\": true,
  \"EnableGeoZoneASIA\": false,
  \"EnableGeoZoneSA\": true,
  \"EnableGeoZoneAF\": false,
  \"Name\": \"$project_id\",
  \"PermaCacheStorageZoneId\": $storage_id,
  \"CacheControlMaxAgeOverride\": 31919000,
  \"EnableOriginShield\": false
}
")

  get_pull_zone_id
  printf "\n\n> Created pull zone \"$pull_zone_id\" with origin \"$origin_url\""
fi

if [ -n "$domain" ]; then
  printf "\n"
  curl --silent --request POST \
    --url https://api.bunny.net/pullzone/$pull_zone_id/addHostname \
    --header "AccessKey: $BUNNYNET_API_KEY" \
    --header 'content-type: application/json' \
    --data "{\"Hostname\":\"$domain\"}"
  printf "\n\n> Added hostname \"$domain\" to pull zone"

  script_dir=$(dirname $0)
  bash $script_dir/bunny-config-base.sh $project_id $domain
fi
