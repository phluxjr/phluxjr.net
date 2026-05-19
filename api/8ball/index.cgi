#!/usr/local/bin/zsh

echo "Content-Type: text/plain"
echo ""

# Handle POST
if [ "$REQUEST_METHOD" = "POST" ]; then
    read -r POST_DATA
    QUESTION=$(echo "$POST_DATA" | sed 's/question=//' | sed 's/+/ /g' | sed 's/%20/ /g' | sed 's/%21/!/g' | sed 's/%3F/?/g')
fi

# Responses array (shell edition lol)
RESPONSES="it is certain
without a doubt
yes definitely
heck yeah brother
reply hazy try again
ask again later
cannot predict now
don't count on it
my reply is no
outlook not so good
very doubtful
absolutely frickin not
haha no
skill issue"

# Get random line (freebsd compatible)
ANSWER=$(echo "$RESPONSES" | awk 'BEGIN{srand()}{lines[NR]=$0}END{print lines[int(rand()*NR)+1]}')

echo "🎱 $ANSWER"
