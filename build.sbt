name := """football-manager"""
organization := "com.sandara"

version := "1.0-SNAPSHOT"

lazy val root = (project in file("."))
  .enablePlugins(PlayJava)

scalaVersion := "2.13.18"

libraryDependencies ++= Seq(
  guice,
  jdbc,
  filters,
  "org.postgresql" % "postgresql" % "42.7.3"
)