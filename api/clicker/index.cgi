#!/usr/local/bin/perl
use strict;
use warnings;
use CGI qw(:standard);

# THE BUTTON - global click counter
# written in perl for the meme 
# (c) phluxjr.net - powered by pure vibes

my $COUNTER_FILE = "/var/db/clicker/count.txt";
my $LOCK_FILE    = "/var/db/clicker/count.lock";

# init counter if it doesn't exist
unless (-f $COUNTER_FILE) {
    open(my $fh, '>', $COUNTER_FILE) or die "cannot create counter: $!";
    print $fh "0";
    close($fh);
}

my $q      = CGI->new;
my $action = $q->param('action') // '';

# lock helper (mkdir is atomic, perfect for locking)
sub acquire_lock {
    while (!mkdir($LOCK_FILE)) {
        select(undef, undef, undef, 0.01); # sleep 10ms
    }
}

sub release_lock {
    rmdir($LOCK_FILE);
}

sub read_count {
    open(my $fh, '<', $COUNTER_FILE) or return 0;
    my $count = <$fh>;
    close($fh);
    chomp $count;
    return int($count);
}

sub write_count {
    my ($count) = @_;
    open(my $fh, '>', $COUNTER_FILE) or die "cannot write counter: $!";
    print $fh $count;
    close($fh);
}

# increment
if ($action eq 'increment') {
    acquire_lock();
    my $count = read_count() + 1;
    write_count($count);
    release_lock();

    print "Status: 200 OK\r\n";
    print "Content-Type: application/json\r\n\r\n";
    print "{\"count\": $count, \"action\": \"increment\"}\n";
    exit 0;
}

# get
if ($action eq 'get') {
    my $count = read_count();

    print "Status: 200 OK\r\n";
    print "Content-Type: application/json\r\n\r\n";
    print "{\"count\": $count}\n";
    exit 0;
}

# bad request
print "Status: 400 Bad Request\r\n";
print "Content-Type: application/json\r\n\r\n";
print "{\"error\": \"invalid action. use action=increment or action=get\"}\n";

