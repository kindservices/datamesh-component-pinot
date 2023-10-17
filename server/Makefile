run: build
	. ./build.sh && run
build:
	. ./build.sh && build
buildLocally:
	scala-cli --power package Server.scala -o server.jar --assembly
push: build
	. ./build.sh && push
installArgo:
	. ./build.sh && installArgo
