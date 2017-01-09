echo "# axSGrease: Scripts for various websites" > readme.md && 
egrep -h "^// @(name|description|license|author|version|copyright)\s" * |
sed -r "s=//\s==" |
sed -r "s/@name\s+/## /" |
sed -r "s/@description\s+//" |
sed "s/@((copyright|author|license|version))\s+/* \1: /" -r | 
sed -r "s/(^##.+)/\n\1\n/" >> readme.md