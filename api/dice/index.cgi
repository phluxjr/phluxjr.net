#!/usr/local/bin/zsh

echo "Content-Type: text/plain"
echo ""

# Parse dice notation (e.g., 2d20+5)
if [ "$REQUEST_METHOD" = "POST" ]; then
    read -r POST_DATA
    DICE=$(echo "$POST_DATA" | sed 's/dice=//' | sed 's/+/ /g')
else
    DICE=$(echo "$QUERY_STRING" | sed 's/dice=//')
fi

# Default to 1d6
[ -z "$DICE" ] && DICE="1d6"

# Parse NdS format
NUM=$(echo "$DICE" | cut -d'd' -f1)
SIDES=$(echo "$DICE" | cut -d'd' -f2 | cut -d'+' -f1 | cut -d'-' -f1)
MOD=$(echo "$DICE" | grep -o '[+-][0-9]*' || echo "+0")

TOTAL=0
ROLLS=""

i=1
while [ $i -le "$NUM" ]; do
    ROLL=$((RANDOM % SIDES + 1))
    ROLLS="$ROLLS $ROLL"
    TOTAL=$((TOTAL + ROLL))
    i=$((i + 1))
done

TOTAL=$((TOTAL + MOD))

echo "🎲 Rolling $DICE"
echo "Rolls:$ROLLS"
echo "Total: $TOTAL"
