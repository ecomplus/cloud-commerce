#!/bin/bash

# Read the first 10 URLs into an array
readarray -t urls < <(head -n 10 benchmark-urls.txt)

# Loop through the first 10 URLs and make a request to each one
serial_sum=0
for url in "${urls[@]}"
do
    ttfb=$(curl -s -w '%{time_starttransfer}\n' -o /dev/null "$url")
    serial_sum=$(echo "$serial_sum + $ttfb" | bc -l)
    echo "$url ${ttfb}s"
done

# Calculate and print the average response time for the serial run
serial_avg=$(echo "$serial_sum / 10" | bc -l)
printf "
-- // --
Average TTFB for serial run: $serial_avg seconds \n\n"

# Read the last 10 URLs into an array
readarray -t urls < <(tail -n 10 benchmark-urls.txt)

# Loop through the last 10 URLs and make a request to each one in parallel
concurrent_ttfbs_file=".concurrent-ttfbs.txt"
for url in "${urls[@]}"
do
    {
        ttfb=$(curl -s -w '%{time_starttransfer}\n' -o /dev/null "$url")
        echo "$ttfb" >> $concurrent_ttfbs_file
        echo "$url ${ttfb}s"
    } &
done

# Wait for all background processes to finish before exiting
wait

# Read the tmp file with concurrent TTFBs and calculate the sum
concurrent_ttfbs=($(cat $concurrent_ttfbs_file))
concurrent_sum=0
for ttfb in ${concurrent_ttfbs[*]}; do
    concurrent_sum=$(echo "$concurrent_sum + $ttfb" | bc)
done
rm $concurrent_ttfbs_file

# Calculate and print the average response time for the concurrent run
concurrent_avg=$(echo "$concurrent_sum / 10" | bc -l)
printf "
-- // --
Average TTFB for concurrent run: $concurrent_avg seconds \n"
