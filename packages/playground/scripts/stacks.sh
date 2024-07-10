
#!/bin/bash

services=("GridProxy" "RMB" "TFChain")

show_menu() {
    echo "Choose a Service:"
    for (( i=0; i<${#services[@]}; i++ )); do
        echo "- ${services[i]}"
    done
    echo "or enter 'q' to exit"

}
remove_option() {
    local choice=$1
    unset 'services[choice-1]'
    services=("${services[@]}")
}

handle_choice() {
    read -p "Enter your choice: " choice
    for  i in "${!services[@]}"; do 
      if [[ " ${services[i]} " == " $choice " ]]; then
        read -a l
        r= echo $(array_to_string "${l[@]}")
        unset 'services[i]'
        services=("${services[@]}")
      elif [ "$choice" == "q" ]; then
        echo bye && exit
      fi
    done
}

array_to_string(){
  local service_urls=("$@")
  quoted_string=""
  for item in "${service_urls[@]}"; do
    quoted_string+="'$item' "
  done  
  echo "[${quoted_string// /,}]"
}

count=0
while [ $count -lt 5 ]; do
    show_menu
    handle_choice
    echo
    ((count++))
done
