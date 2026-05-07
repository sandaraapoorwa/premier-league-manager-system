package utils;

import java.sql.*;

public class DB {

    private static final String URL = "jdbc:postgresql://localhost:5432/football_manager";
    private static final String USER = "sandaraapoorwa";
    private static final String PASSWORD = "";

    public static Connection getConnection() throws Exception {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}