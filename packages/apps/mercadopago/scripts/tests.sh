if [ $MERCADOPAGO_TOKEN != "" ] 
    then 
        node --test tests/
else
  echo -e "MERCADOPAGO_TOKEN not found\n"
fi