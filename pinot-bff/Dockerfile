FROM virtuslab/scala-cli:latest AS build
RUN mkdir -p /app/ui
COPY ["Server.scala", "/app/"]
COPY ["log4j2.xml",  "/app/"]
COPY ["ui/", "/app/ui/"]
WORKDIR /app
RUN scala-cli --power package Server.scala -o server.jar --assembly

FROM openjdk:18-oraclelinux8
RUN mkdir -p /app/ui
COPY --from=build /app/*.* /app/
COPY --from=build /app/ui/ /app/ui/
WORKDIR /app
EXPOSE 8080
ENV PORT=8080
CMD java -cp log4j2.xml -jar server.jar