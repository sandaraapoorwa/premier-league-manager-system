name := """football-manager"""
organization := "com.sandara"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.13.18"

libraryDependencies += guice
libraryDependencies += "org.postgresql" % "postgresql" % "42.7.3"
libraryDependencies += jdbc