#!/bin/bash

PALI=https://www.paliaudio.com
scrape () 
{
    curl -s $PALI/$1 \
    | grep -E 'h2|href="[^"].*sqs-block-button-element' \
    | grep -v -e '/^$/' \
    | sed -E 's/.*href="([^"]*).*/\1/' \
    | sed -E 's/.*h2[^>]*>(.*)<.h2>.*/\1/' \
    | sed -E 's/<[^>]*>//g'

}


scrape majjhima-nikaya
scrape digha-nikaya
scrape section-of-ones
