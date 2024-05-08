SMTP_HOST=`cat tests/config-test.json | jq .smtp_host`
SMTP_PASS=`cat tests/config-test.json | jq .smtp_pass`
SMTP_PORT=`cat tests/config-test.json | jq .smtp_port`
SMTP_USER=`cat tests/config-test.json | jq .smtp_user`
TO_EMAIL=`cat tests/config-test.json | jq .to_email`
MAIL_SENDER=`cat tests/config-test.json | jq .from_email`
SENDGRID_API_KEY=`cat tests/config-test.json | jq .sendgrid_api_key`
TEMPLATE_ID_ORDERS=`cat tests/config-test.json | jq .templateId_orders`

SMTP_HOST="${SMTP_HOST//\"/}"
SMTP_PASS="${SMTP_PASS//\"/}"
SMTP_PORT="${SMTP_PORT//\"/}"
SMTP_USER="${SMTP_USER//\"/}"
TO_EMAIL="${TO_EMAIL//\"/}"
MAIL_SENDER="${MAIL_SENDER//\"/}"
SENDGRID_API_KEY="${SENDGRID_API_KEY//\"/}"
TEMPLATE_ID_ORDERS="${TEMPLATE_ID_ORDERS//\"/}"

export SMTP_HOST=$SMTP_HOST
export SMTP_PASS=$SMTP_PASS
export SMTP_PORT=$SMTP_PORT
export SMTP_USER=$SMTP_USER
export TO_EMAIL=$TO_EMAIL
export MAIL_SENDER=$MAIL_SENDER
export SENDGRID_API_KEY=$SENDGRID_API_KEY
export TEMPLATE_ID_ORDERS=$TEMPLATE_ID_ORDERS

echo 'Waiting for changes to files'


inotifywait -rqm --event close_write --format '%w%f' \
  src/ tests/ |

while read -r filepath file; do
  clear
  printf "\n File: $filepath\n\n"
  if [[ $filepath =~ \.ts$ ]]; then
    printf "\n Build: $filepath\n\n"
    npm run build
  fi
  NODE_OPTIONS="--experimental-vm-modules" NODE_ENV="development" node --test tests/ 
done

