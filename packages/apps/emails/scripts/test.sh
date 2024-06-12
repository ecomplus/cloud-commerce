
if [ -z "$SMTP_PASS" ]; then
  echo -e "SMTP_PASS not set\n"
else
  rm -rf functions
  mkdir functions 
  mkdir functions/ssr
  mkdir functions/ssr/content
  cp ../../../store/functions/ssr/content/settings.json functions/ssr/content/settings.json
  npm run build
  node --test tests/ && rm -rf functions
fi
