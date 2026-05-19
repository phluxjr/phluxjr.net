#!/bin/sh

echo "Content-Type: text/plain"
echo ""

# Handle both GET and POST
if [ "$REQUEST_METHOD" = "POST" ]; then
    # Read POST data from stdin
    read -r POST_DATA
    MESSAGE=$(echo "$POST_DATA" | sed 's/message=//' | sed 's/+/ /g' | sed 's/%20/ /g' | sed 's/%21/!/g' | sed 's/%3F/?/g')
else
    # GET request - parse query string
    MESSAGE=$(echo "$QUERY_STRING" | sed 's/message=//' | sed 's/+/ /g' | sed 's/%20/ /g')
fi

if [ -z "$MESSAGE" ]; then
    MESSAGE="Moo! Welcome to Cowsay-as-a-Service!"
fi

/usr/local/bin/cowsay "$MESSAGE"
