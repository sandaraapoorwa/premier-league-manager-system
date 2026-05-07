package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;
import java.util.*;

public class FixtureController extends Controller {

    public Result generateFixtures() {

        List<String> teams = new ArrayList<>();

        try (Connection conn = DB.getConnection()) {

            // 1. Get all teams from clubs table
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT name FROM clubs");

            while (rs.next()) {
                teams.add(rs.getString("name"));
            }

            // 2. Generate all unique matches
            for (int i = 0; i < teams.size(); i++) {
                for (int j = i + 1; j < teams.size(); j++) {

                    String home = teams.get(i);
                    String away = teams.get(j);

                    String sql = "INSERT INTO matches (home_team, away_team, home_goals, away_goals) VALUES (?, ?, 0, 0)";

                    PreparedStatement ps = conn.prepareStatement(sql);
                    ps.setString(1, home);
                    ps.setString(2, away);
                    ps.executeUpdate();
                }
            }

            return ok("Fixtures generated successfully ⚽");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}