#!/bin/bash
#Name:      beatport.sh
#Version:   1.00
#Author:    Mario Rybar
#Created:   11.11.2017
#set -x
  #VARIABLES
  TRACKLOG="/home/bradrs/logs/TRACKB.log"
  RELEASELOG="/home/bradrs/logs/RELEASEB.log"
  LOG="/tmp/bp_match_$(date +"%m%d%Y"%H%M%S).log"
  USER_ID=$1


#generate prefferences
create_preferences_array() {

  echo -e '#!/bin/bash\n\n##variable\ndeclare -a MYFIELD=(' > /tmp/preferences.sh
  MYSQLPSSWD="parkour2"
  mysql -u"admin" -p"${MYSQLPSSWD}" -sN -e "SELECT artist FROM reg1.pref WHERE user_id = ${USER_ID};" | sed -e 's/^/"/g' | sed -e 's/$/"/g' >> /tmp/preferences.sh
  echo -e ');' >> /tmp/preferences.sh
}


#Cleaning
cleaning() {
  rm -rf ${TRACKLOG}
  rm -rf ${RELEASELOG}
}

#Get releasess
get_that_music() {
  #Get page #1
  curl https://www.beatport.com/genre/drum-and-bass/1/tracks > ${TRACKLOG}
  curl https://www.beatport.com/genre/drum-and-bass/1/releases > ${RELEASELOG}
  #Get page #2
  curl https://www.beatport.com/genre/drum-and-bass/1/tracks?page=2 >> ${TRACKLOG}
  curl https://www.beatport.com/genre/drum-and-bass/1/releases?page=2 >> ${RELEASELOG}
  #get page 3
  curl https://www.beatport.com/genre/drum-and-bass/1/tracks?page=3 >> ${TRACKLOG}
  curl https://www.beatport.com/genre/drum-and-bass/1/releases?page=3 >> ${RELEASELOG}
  #get page 4
  curl https://www.beatport.com/genre/drum-and-bass/1/tracks?page=4 >> ${TRACKLOG}
  #curl https://www.beatport.com/genre/drum-and-bass/1/releases?page=4 >> ${RELEASELOG}
}

#Main function
fav_track() {
  echo "$(date +"%m-%d-%Y")" > ${LOG}
  echo "=============================================" >> ${LOG}
  for i in "${MYFIELD[@]}"
    do
      cat ${TRACKLOG} | grep "$i<" &>1
      if [[ "$?" == 0 ]]; then
        WC=$(cat ${TRACKLOG} | grep -B 30 "$i<" | grep -iPo '(?<=data-ec-name\=\").*(?=\")' | sed -e "s/&#39;/'/g" | sort | uniq | wc -l)
        if [[ `echo "${WC}"` != 0 ]]; then
          TRACK=$(cat ${TRACKLOG} | grep -B 30 "$i<" | grep -iPo '(?<=data-ec-name\=\").*(?=\")' | sed -e "s/&#39;/'/g" | sort | uniq)
          LABEL=$(cat ${TRACKLOG} | grep -B 30 "$i<" | grep -iPo '(?<=data-ec-brand\=\").*(?=\")' | sort | uniq)
          RELEASE=$(cat ${RELEASELOG} | grep -B 30 "$i<" | grep -iPo '(?<=data-ec-name\=\").*(?=\")' | sed -e "s/&#39;/'/g")
          RDATE=$(cat ${RELEASELOG} | grep -A 10 "$i<" | grep -iPo '(?<=release-released\"\>).*(?=\<)')
          echo -e "Artist:&emsp;$i" | sed 's/amp;//g' >> ${LOG}
          echo -e "EP:&emsp;&emsp;${RELEASE}" >> ${LOG}
          echo -e "Date:&emsp;${RDATE}" >> ${LOG}
          echo -e "Label:&emsp;${LABEL}" >> ${LOG}
          echo -n "Tracks:&emsp;" >> ${LOG}; echo "${TRACK}" | sed -e 's/^/\t/' >> ${LOG}

        fi
        echo "=============================================" >> ${LOG}
      fi
      cat ${RELEASELOG} | grep ">$i<" &>1
      if [[ "$?" == 0 ]]; then
        LABEL=$(cat ${RELEASELOG} | grep -B 30 ">$i<" | grep -iPo '(?<=data-ec-brand\=\").*(?=\")' | sort | uniq)
        RELEASE=$(cat ${RELEASELOG} | grep -B 30 ">$i<" | grep -iPo '(?<=data-ec-name\=\").*(?=\")' | sed -e "s/&#39;/'/g")
        RDATE=$(cat ${RELEASELOG} | grep -A 10 ">$i<" | grep -iPo '(?<=release-released\"\>).*(?=\<)')
        if [[ `grep "${RELEASE}" ${LOG} -c` == 0 ]]; then
          echo -e "Artist:&emsp;$i" >> ${LOG}
          echo -e "EP:&emsp;&emsp;${RELEASE}" >> ${LOG}
          echo -e "Date:&emsp;${RDATE}" >> ${LOG}
          echo -e "Label:&emsp;${LABEL}" >> ${LOG}
          echo "=============================================" >> ${LOG}
        fi
      fi
  done
}

#read log
read_log() {
  echo "<hr>" >> ${LOG}
  cat ${LOG} | sed -e 's/^/<br\/>/g'
}


### MAIN #################################################################
  create_preferences_array
  #Importing preferences
  cd /tmp/
  . ./preferences.sh
  #get_that_music
  fav_track
  #cleaning
  read_log
