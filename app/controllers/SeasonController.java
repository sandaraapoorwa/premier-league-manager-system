package controllers;

import play.mvc.*;
import utils.DB;
import utils.TeamStrength;

import java.sql.*;
import java.util.Random;

public class SeasonController extends Controller {

    public Result playSeason() {

        Random random = new Random();

        try (Connection conn = DB.getConnection()) {
            System.out.println("DB CONNECTED TO: " + conn.getMetaData().getURL());

            Statement stmt = conn.createStatement();

            // Get all matches
            ResultSet rs = stmt.executeQuery(
                    "SELECT * FROM matches"
            );

            while (rs.next()) {

                long id = rs.getLong("id");

                String homeTeam =
                        rs.getString("home_team");

                String awayTeam =
                        rs.getString("away_team");

                // TEAM STATS
                int homeAttack =
                        TeamStrength.getAttack(conn, homeTeam);

                int homeDefense =
                        TeamStrength.getDefense(conn, homeTeam);

                int awayAttack =
                        TeamStrength.getAttack(conn, awayTeam);

                int awayDefense =
                        TeamStrength.getDefense(conn, awayTeam);

                // HOME ADVANTAGE
                homeAttack += 5;

                // MATCH LOGIC
                double homeChance =
                        (homeAttack * 1.2)
                                - (awayDefense * 0.8);

                double awayChance =
                        (awayAttack * 1.1)
                                - (homeDefense * 0.9);

                // REALISTIC GOALS
                int homeGoals = Math.max(
                        0,
                        (int)(homeChance / 25
                                + random.nextInt(3))
                );

                int awayGoals = Math.max(
                        0,
                        (int)(awayChance / 25
                                + random.nextInt(3))
                );

                // UPDATE MATCH
                PreparedStatement ps =
                        conn.prepareStatement(
                                "UPDATE matches " +
                                        "SET home_goals=?, away_goals=? " +
                                        "WHERE id=?"
                        );

                ps.setInt(1, homeGoals);
                ps.setInt(2, awayGoals);
                ps.setLong(3, id);

                ps.executeUpdate();
            }

            return ok(
                    "Season completed successfully ⚽"
            );

        } catch (Exception e) {

            return internalServerError(
                    e.getMessage()
            );
        }
    }
}