if [ $FRENET_TOKEN != "" ] 
    then 
        node --test tests/
else
  echo -e "FRENET_TOKEN not found\n"
fi