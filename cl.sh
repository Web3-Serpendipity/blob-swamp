echo "Checking configuration..."
lighttpd -tt -f lighttpd.conf
echo "Launching lighttpd"
lighttpd -D -f lighttpd.conf
