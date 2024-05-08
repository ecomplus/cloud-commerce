SMTP_HOST=`cat tests/config-test.json | jq .smtp_host`
SMTP_PASS=`cat tests/config-test.json | jq .smtp_pass`
SMTP_PORT=`cat tests/config-test.json | jq .smtp_port`
SMTP_USER=`cat tests/config-test.json | jq .smtp_user`
TO_EMAIL=`cat tests/config-test.json | jq .to_email`
MAIL_SENDER=`cat tests/config-test.json | jq .from_email`

SMTP_HOST="${SMTP_HOST//\"/}"
SMTP_PASS="${SMTP_PASS//\"/}"
SMTP_PORT="${SMTP_PORT//\"/}"
SMTP_USER="${SMTP_USER//\"/}"
TO_EMAIL="${TO_EMAIL//\"/}"
MAIL_SENDER="${MAIL_SENDER//\"/}"

export SMTP_HOST=$SMTP_HOST
export SMTP_PASS=$SMTP_PASS
export SMTP_PORT=$SMTP_PORT
export SMTP_USER=$SMTP_USER
export TO_EMAIL=$TO_EMAIL
export MAIL_SENDER=$MAIL_SENDER


npm run build
NODE_OPTIONS="--experimental-vm-modules" NODE_ENV="development" node --test tests/ 


