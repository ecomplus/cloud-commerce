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

curl --silent --request POST \
  --url "https://api.bunny.net/pullzone/$pull_zone_id" \
  --header "AccessKey: $BUNNYNET_API_KEY" \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '
{
  "EnableGeoZoneUS": true,
  "EnableGeoZoneEU": true,
  "EnableGeoZoneASIA": false,
  "EnableGeoZoneSA": true,
  "EnableGeoZoneAF": false,
  "ZoneSecurityEnabled": false,
  "ZoneSecurityIncludeHashRemoteIP": false,
  "IgnoreQueryStrings": true,
  "MonthlyBandwidthLimit": 0,
  "AddHostHeader": false,
  "OriginHostHeader": "",
  "Type": 0,
  "AccessControlOriginHeaderExtensions": [
    "eot",
    "ttf",
    "woff",
    "woff2",
    "css"
  ],
  "EnableAccessControlOriginHeader": true,
  "DisableCookies": true,
  "CacheControlPublicMaxAgeOverride": -1,
  "BurstSize": 0,
  "RequestLimit": 0,
  "BlockRootPathAccess": false,
  "BlockPostRequests": false,
  "LimitRatePerSecond": 0,
  "LimitRateAfter": 0,
  "ConnectionLimitPerIPCount": 0,
  "AddCanonicalHeader": false,
  "EnableLogging": true,
  "EnableCacheSlice": false,
  "EnableSmartCache": false,
  "EnableWebPVary": false,
  "EnableAvifVary": false,
  "EnableCountryCodeVary": false,
  "EnableMobileVary": false,
  "EnableCookieVary": false,
  "CookieVaryParameters": [],
  "EnableHostnameVary": false,
  "LoggingIPAnonymizationEnabled": true,
  "EnableTLS1": true,
  "EnableTLS1_1": true,
  "VerifyOriginSSL": false,
  "ErrorPageEnableCustomCode": false,
  "ErrorPageEnableStatuspageWidget": false,
  "ErrorPageWhitelabel": false,
  "OriginShieldZoneCode": "IL",
  "LogForwardingEnabled": false,
  "LoggingSaveToStorage": false,
  "FollowRedirects": false,
  "OriginRetries": 0,
  "OriginConnectTimeout": 5,
  "OriginResponseTimeout": 15,
  "UseStaleWhileUpdating": true,
  "UseStaleWhileOffline": true,
  "OriginRetry5XXResponses": false,
  "OriginRetryConnectionTimeout": true,
  "OriginRetryResponseTimeout": true,
  "OriginRetryDelay": 0,
  "QueryStringVaryParameters": [],
  "OriginShieldEnableConcurrencyLimit": false,
  "OriginShieldMaxConcurrentRequests": 200,
  "EnableSafeHop": false,
  "CacheErrorResponses": false,
  "OriginShieldQueueMaxWaitTime": 30,
  "OriginShieldMaxQueuedRequests": 5000,
  "UseBackgroundUpdate": true,
  "EnableAutoSSL": false,
  "EnableQueryStringOrdering": true,
  "LogAnonymizationType": 0,
  "LogFormat": 1,
  "LogForwardingFormat": 1,
  "ShieldDDosProtectionType": 1,
  "ShieldDDosProtectionEnabled": false,
  "EnableRequestCoalescing": false,
  "RequestCoalescingTimeout": 30,
  "DisableLetsEncrypt": false,
  "EnableBunnyImageAi": false,
  "PreloadingScreenEnabled": false,
  "RoutingFilters": [
    "all"
  ]
}
'
printf "\n\n> Configured pull zone \"$pull_zone_id\"\n"

configure_edge_rule() {
  printf "\n"
  local description=$1
  local rule_data=$2
  local found_rule=$(echo $edge_rules | jq --arg description "$description" '.[] | select(.Description == $description)')
  local guid=$(echo $found_rule | jq -r '.Guid // empty')

  local json_data="$rule_data"
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

configure_edge_rule "APIs bypass CDN cache" '
{
  "ActionType": 3,
  "ActionParameter1": "0",
  "ActionParameter2": "",
  "Triggers": [
    {
      "Type": 0,
      "PatternMatches": [
        "*/_api/*",
        "*/_feeds/*",
        "*/.*/git/*",
        "*/_analytics",
        "*/~*"
      ],
      "PatternMatchingType": 0,
      "Parameter1": ""
    }
  ],
  "TriggerMatchingType": 1,
  "Description": "APIs bypass CDN cache",
  "Enabled": true
}
'

configure_edge_rule "APIs bypass perma-cache" '
{
  "ActionType": 15,
  "ActionParameter1": null,
  "ActionParameter2": null,
  "Triggers": [
    {
      "Type": 0,
      "PatternMatches": [
        "*/_api/*",
        "*/_feeds/*",
        "*/.*/git/*",
        "*/_analytics",
        "*/~*"
      ],
      "PatternMatchingType": 0,
      "Parameter1": ""
    }
  ],
  "TriggerMatchingType": 1,
  "Description": "APIs bypass perma-cache",
  "Enabled": true
}
'

configure_edge_rule "SSR browser cache" '
{
  "ActionType": 16,
  "ActionParameter1": "120",
  "ActionParameter2": null,
  "Triggers": [
    {
      "Type": 0,
      "PatternMatches": [
        "*/_astro/*"
      ],
      "PatternMatchingType": 2,
      "Parameter1": ""
    },
    {
      "Type": 3,
      "PatternMatches": [
        "webp",
        "png",
        "jpg",
        "woff2",
        "mp4"
      ],
      "PatternMatchingType": 2,
      "Parameter1": ""
    }
  ],
  "TriggerMatchingType": 1,
  "Description": "SSR browser cache",
  "Enabled": true
}
'
