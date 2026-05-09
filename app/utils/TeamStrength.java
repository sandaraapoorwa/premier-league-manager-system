package utils;

import java.sql.*;

public class TeamStrength {

    public static int getAttack(Connection conn, String teamName) throws Exception {

        String sql = "SELECT attack FROM teams WHERE name = ?";

        PreparedStatement stmt = conn.prepareStatement(sql);

        stmt.setString(1, teamName);

        ResultSet rs = stmt.executeQuery();

        if (rs.next()) {
            return rs.getInt("attack");
        }

        return 70;
    }

    public static int getDefense(Connection conn, String teamName) throws Exception {

        String sql = "SELECT defense FROM teams WHERE name = ?";

        PreparedStatement stmt = conn.prepareStatement(sql);

        stmt.setString(1, teamName);

        ResultSet rs = stmt.executeQuery();

        if (rs.next()) {
            return rs.getInt("defense");
        }

        return 70;
    }
}