package controllers;

import play.mvc.*;
import utils.DB;
import utils.TeamStrength;

import java.sql.*;
import java.util.Random;

public class SimulationController extends Controller {

    public Result simulateMatches() {

        Random random = new Random();

        try (Connection conn = DB.getConnection()) {

            // Only fetch unplayed matches
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                    "SELECT * FROM matches WHERE home_goals IS NULL AND away_goals IS NULL"
            );

            while (rs.next()) {

                long id        = rs.getLong("id");
                String homeTeam = rs.getString("home_team");
                String awayTeam = rs.getString("away_team");

                int homeAttack  = TeamStrength.getAttack(conn, homeTeam);
                int homeDefense = TeamStrength.getDefense(conn, homeTeam);
                int awayAttack  = TeamStrength.getAttack(conn, awayTeam);
                int awayDefense = TeamStrength.getDefense(conn, awayTeam);

                homeAttack += 5; // home advantage

                double homeChance = (homeAttack * 1.2) - (awayDefense * 0.8);
                double awayChance = (awayAttack * 1.1) - (homeDefense * 0.9);

                int homeGoals = Math.max(0, (int)(homeChance / 25 + random.nextInt(3)));
                int awayGoals = Math.max(0, (int)(awayChance / 25 + random.nextInt(3)));

                PreparedStatement ps = conn.prepareStatement(
                        "UPDATE matches SET home_goals = ?, away_goals = ? WHERE id = ?"
                );
                ps.setInt(1, homeGoals);
                ps.setInt(2, awayGoals);
                ps.setLong(3, id);
                ps.executeUpdate();
            }

            return ok("Matches simulated successfully ⚽");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}