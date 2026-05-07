package utils;

import java.sql.*;

public class TeamStrength {

    public static double getStrength(Connection conn, String club) throws Exception {

        String sql = "SELECT rating FROM players WHERE club = ?";

        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, club);

        ResultSet rs = ps.executeQuery();

        int total = 0;
        int count = 0;

        while (rs.next()) {
            total += rs.getInt("rating");
            count++;
        }

        if (count == 0) return 70; // default weak team

        return (double) total / count;
    }
}