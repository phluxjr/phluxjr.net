#!/bin/sh

# Catppuccin Color API - Shell Version

# Get color value from palette
get_color() {
    flavor="$1"
    color_name="$2"
    
    case "$flavor" in
        mocha)
            case "$color_name" in
                rosewater) echo "fae3dc" ;; flamingo) echo "f2cdcd" ;; pink) echo "f5c2e7" ;;
                mauve) echo "cba6f7" ;; red) echo "f38ba8" ;; maroon) echo "eba0ac" ;;
                peach) echo "fab387" ;; yellow) echo "f9e2af" ;; green) echo "a6e3a1" ;;
                teal) echo "94e2d5" ;; sky) echo "89dceb" ;; sapphire) echo "74c7ec" ;;
                blue) echo "89b4fa" ;; lavender) echo "b4befe" ;; text) echo "cdd6f4" ;;
                subtext1) echo "bac2de" ;; subtext0) echo "a6adc8" ;; overlay2) echo "9399b2" ;;
                overlay1) echo "7f849c" ;; overlay0) echo "6c7086" ;; surface2) echo "585b70" ;;
                surface1) echo "45475a" ;; surface0) echo "313244" ;; base) echo "1e1e2e" ;;
                mantle) echo "181825" ;; crust) echo "11111b" ;; *) echo "" ;;
            esac ;;
        latte)
            case "$color_name" in
                rosewater) echo "dc8a78" ;; flamingo) echo "dd7878" ;; pink) echo "ea76cb" ;;
                mauve) echo "8839ef" ;; red) echo "d20f39" ;; maroon) echo "e64553" ;;
                peach) echo "fe640b" ;; yellow) echo "df8e1d" ;; green) echo "40a02b" ;;
                teal) echo "179299" ;; sky) echo "04a5e5" ;; sapphire) echo "209fb5" ;;
                blue) echo "1e66f5" ;; lavender) echo "7287fd" ;; text) echo "4c4f69" ;;
                subtext1) echo "5c5f77" ;; subtext0) echo "6c6f85" ;; overlay2) echo "7c7f93" ;;
                overlay1) echo "8c8fa1" ;; overlay0) echo "9ca0b0" ;; surface2) echo "acb0be" ;;
                surface1) echo "bcc0cc" ;; surface0) echo "ccd0da" ;; base) echo "eff1f5" ;;
                mantle) echo "e6e9ef" ;; crust) echo "dce0e8" ;; *) echo "" ;;
            esac ;;
        frappe)
            case "$color_name" in
                rosewater) echo "f2d5cf" ;; flamingo) echo "eebebe" ;; pink) echo "f4b8e4" ;;
                mauve) echo "ca9ee6" ;; red) echo "e78284" ;; maroon) echo "ea999c" ;;
                peach) echo "ef9f76" ;; yellow) echo "e5c890" ;; green) echo "a6d189" ;;
                teal) echo "81c8be" ;; sky) echo "99d1db" ;; sapphire) echo "85c1dc" ;;
                blue) echo "8caaee" ;; lavender) echo "babbf1" ;; text) echo "c6d0f5" ;;
                subtext1) echo "b5bfe2" ;; subtext0) echo "a5adce" ;; overlay2) echo "949cbb" ;;
                overlay1) echo "838ba7" ;; overlay0) echo "737994" ;; surface2) echo "626880" ;;
                surface1) echo "51576d" ;; surface0) echo "414559" ;; base) echo "303446" ;;
                mantle) echo "292c3c" ;; crust) echo "232634" ;; *) echo "" ;;
            esac ;;
        macchiato)
            case "$color_name" in
                rosewater) echo "f4dbd6" ;; flamingo) echo "f0c6c6" ;; pink) echo "f5bde6" ;;
                mauve) echo "c6a0f6" ;; red) echo "ed8796" ;; maroon) echo "ee99a0" ;;
                peach) echo "f5a97f" ;; yellow) echo "eed49f" ;; green) echo "a6da95" ;;
                teal) echo "8bd5ca" ;; sky) echo "91d7e3" ;; sapphire) echo "7dc4e4" ;;
                blue) echo "8aadf4" ;; lavender) echo "b7bdf8" ;; text) echo "cad3f5" ;;
                subtext1) echo "b8c0e0" ;; subtext0) echo "a5adcb" ;; overlay2) echo "939ab7" ;;
                overlay1) echo "8087a2" ;; overlay0) echo "6e738d" ;; surface2) echo "5b6078" ;;
                surface1) echo "494d64" ;; surface0) echo "363a4f" ;; base) echo "24273a" ;;
                mantle) echo "1e2030" ;; crust) echo "181926" ;; *) echo "" ;;
            esac ;;
        *) echo "" ;;
    esac
}

get_all_colors() {
    echo "rosewater flamingo pink mauve red maroon peach yellow green teal sky sapphire blue lavender text subtext1 subtext0 overlay2 overlay1 overlay0 surface2 surface1 surface0 base mantle crust"
}

hex_to_rgb() {
    hex="$1"
    # Use dd and od to convert hex to decimal (works on all BSDs)
    r=$(echo "$hex" | cut -c1-2)
    g=$(echo "$hex" | cut -c3-4)
    b=$(echo "$hex" | cut -c5-6)
    r_dec=$(printf "%d" "0x$r")
    g_dec=$(printf "%d" "0x$g")
    b_dec=$(printf "%d" "0x$b")
    echo "$r_dec $g_dec $b_dec"
}

# Parse query string
eval $(echo "$QUERY_STRING" | tr '&' '\n' | while IFS='=' read -r key value; do
    echo "${key}='${value}'"
done)

flavor="${flavor:-mocha}"

# Validate flavor
case "$flavor" in
    mocha|latte|frappe|macchiato) ;;
    *) echo "Status: 400 Bad Request"; echo "Content-Type: application/json"; echo ""; 
       echo '{"error":"Invalid flavor"}'; exit 0 ;;
esac

# File format
if [ -n "$file" ]; then
    case "$file" in
        json)
            echo "Status: 200 OK"; echo "Content-Type: application/json"
            echo "Content-Disposition: attachment; filename=\"catppuccin-${flavor}.json\""; echo ""
            echo "{"; first=1
            for c in $(get_all_colors); do
                hex=$(get_color "$flavor" "$c")
                [ $first -eq 1 ] && first=0 || echo ","
                printf '  "%s": "%s"' "$c" "$hex"
            done
            echo ""; echo "}" ;;
        txt)
            echo "Status: 200 OK"; echo "Content-Type: text/plain"
            echo "Content-Disposition: attachment; filename=\"catppuccin-${flavor}.txt\""; echo ""
            for c in $(get_all_colors); do
                hex=$(get_color "$flavor" "$c"); rgb=$(hex_to_rgb "$hex")
                r=$(echo $rgb | cut -d' ' -f1)
                g=$(echo $rgb | cut -d' ' -f2)
                b=$(echo $rgb | cut -d' ' -f3)
                printf "%-12s #%s  rgb(%d, %d, %d)\n" "$c" "$hex" "$r" "$g" "$b"
            done ;;
        css)
            echo "Status: 200 OK"; echo "Content-Type: text/css"
            echo "Content-Disposition: attachment; filename=\"catppuccin-${flavor}.css\""; echo ""
            echo ":root {"
            for c in $(get_all_colors); do
                hex=$(get_color "$flavor" "$c"); rgb=$(hex_to_rgb "$hex")
                r=$(echo $rgb | cut -d' ' -f1)
                g=$(echo $rgb | cut -d' ' -f2)
                b=$(echo $rgb | cut -d' ' -f3)
                echo "  --ctp-${c}: #${hex};"
                echo "  --ctp-${c}-rgb: ${r}, ${g}, ${b};"
            done
            echo "}" ;;
        *) echo "Status: 400 Bad Request"; echo "Content-Type: application/json"; echo ""
           echo '{"error":"Invalid format"}'; exit 0 ;;
    esac
    exit 0
fi

# Single/random color
if [ -n "$color" ]; then
    hex=$(get_color "$flavor" "$color")
    [ -z "$hex" ] && { echo "Status: 400 Bad Request"; echo "Content-Type: application/json"; echo ""; 
                       echo '{"error":"Invalid color"}'; exit 0; }
else
    all_colors=$(get_all_colors); count=$(echo $all_colors | wc -w)
    idx=$(($(od -An -N2 -i /dev/random 2>/dev/null || echo 1234) % count + 1))
    color=$(echo $all_colors | cut -d' ' -f$idx)
    hex=$(get_color "$flavor" "$color")
fi

rgb=$(hex_to_rgb "$hex")
r=$(echo $rgb | cut -d' ' -f1)
g=$(echo $rgb | cut -d' ' -f2)  
b=$(echo $rgb | cut -d' ' -f3)

echo "Status: 200 OK"
echo "Content-Type: application/json"
echo ""
printf '{\n  "flavor": "%s",\n  "name": "%s",\n  "hex": "#%s",\n  "rgb": "rgb(%d, %d, %d)",\n  "rgb_values": {\n    "r": %d,\n    "g": %d,\n    "b": %d\n  }\n}\n' \
    "$flavor" "$color" "$hex" "$r" "$g" "$b" "$r" "$g" "$b"

