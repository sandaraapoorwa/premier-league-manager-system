package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import play.libs.Json;
import play.mvc.*;
import utils.DB;

import java.sql.*;
import java.util.*;

public class MatchdayController extends Controller {

    // GET /matchday/:id — fixtures + results for a matchday
    public Result getMatchday(int matchday) {
        List<ObjectNode> matches = new ArrayList<>();

        try (Connection conn = DB.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                    "SELECT * FROM matches WHERE matchday = ? ORDER BY id"
            );
            stmt.setInt(1, matchday);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                ObjectNode m = Json.newObject();
                m.put("id",        rs.getLong("id"));
                m.put("homeTeam",  rs.getString("home_team"));
                m.put("awayTeam",  rs.getString("away_team"));
                m.put("matchday",  rs.getInt("matchday"));

                // null means not yet played
                Object hg = rs.getObject("home_goals");
                Object ag = rs.getObject("away_goals");
                if (hg != null) {
                    m.put("homeGoals", (int) hg);
                    m.put("awayGoals", (int) ag);
                }

                String scorers = rs.getString("goal_scorers");
                if (scorers != null) m.put("goalScorers", scorers);

                matches.add(m);
            }

            return ok(Json.toJson(matches));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    // POST /matchday/:id/simulate — simulate one matchday
    public Result simulateMatchday(int matchday) {
        Random random = new Random();

        try (Connection conn = DB.getConnection()) {

            PreparedStatement select = conn.prepareStatement(
                    "SELECT * FROM matches WHERE matchday = ? AND home_goals IS NULL"
            );
            select.setInt(1, matchday);
            ResultSet rs = select.executeQuery();

            boolean anyPlayed = false;

            while (rs.next()) {
                anyPlayed = true;
                long id        = rs.getLong("id");
                String home    = rs.getString("home_team");
                String away    = rs.getString("away_team");

                // Get attack/defense from teams table
                int homeAtk = getStat(conn, home, "attack");
                int homeDef = getStat(conn, home, "defense");
                int awayAtk = getStat(conn, away, "attack");
                int awayDef = getStat(conn, away, "defense");

                homeAtk += 5; // home advantage

                int homeGoals = Math.max(0,
                        (int)((homeAtk * 1.2 - awayDef * 0.8) / 25 + random.nextInt(3)));
                int awayGoals = Math.max(0,
                        (int)((awayAtk * 1.1 - homeDef * 0.9) / 25 + random.nextInt(3)));

                // Pick scorers from players table
                String scorersJson = buildScorers(conn, home, away, homeGoals, awayGoals, random);

                PreparedStatement update = conn.prepareStatement(
                        "UPDATE matches SET home_goals=?, away_goals=?, goal_scorers=? WHERE id=?"
                );
                update.setInt(1, homeGoals);
                update.setInt(2, awayGoals);
                update.setString(3, scorersJson);
                update.setLong(4, id);
                update.executeUpdate();
            }

            if (!anyPlayed) {
                return ok("{\"message\":\"Matchday already played\"}").as("application/json");
            }

            return ok("{\"message\":\"Matchday " + matchday + " simulated ⚽\"}").as("application/json");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    // GET /matchdays/status — returns each matchday and whether it's played
    public Result getStatus() {
        try (Connection conn = DB.getConnection()) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                    "SELECT matchday, " +
                            "COUNT(*) AS total, " +
                            "COUNT(home_goals) AS played " +
                            "FROM matches GROUP BY matchday ORDER BY matchday"
            );

            List<ObjectNode> rows = new ArrayList<>();
            while (rs.next()) {
                ObjectNode row = Json.newObject();
                int total  = rs.getInt("total");
                int played = rs.getInt("played");
                row.put("matchday", rs.getInt("matchday"));
                row.put("total",    total);
                row.put("played",   played);
                row.put("status",   played == 0 ? "pending"
                        : played == total ? "completed"
                        : "partial");
                rows.add(row);
            }

            return ok(Json.toJson(rows));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    // ── helpers ──────────────────────────────────────────

    private int getStat(Connection conn, String team, String col) throws Exception {
        PreparedStatement ps = conn.prepareStatement(
                "SELECT " + col + " FROM teams WHERE name = ? LIMIT 1"
        );
        ps.setString(1, team);
        ResultSet rs = ps.executeQuery();
        return rs.next() ? rs.getInt(col) : 70;
    }

    private String buildScorers(Connection conn,
                                String home, String away,
                                int homeGoals, int awayGoals,
                                Random random) throws Exception {

        List<String> homePlayers = getPlayers(conn, home);
        List<String> awayPlayers = getPlayers(conn, away);

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        ArrayNode homeArr = mapper.createArrayNode();
        ArrayNode awayArr = mapper.createArrayNode();

        for (int i = 0; i < homeGoals; i++) {
            if (!homePlayers.isEmpty())
                homeArr.add(homePlayers.get(random.nextInt(homePlayers.size())));
        }
        for (int i = 0; i < awayGoals; i++) {
            if (!awayPlayers.isEmpty())
                awayArr.add(awayPlayers.get(random.nextInt(awayPlayers.size())));
        }

        root.set("home", homeArr);
        root.set("away", awayArr);
        return mapper.writeValueAsString(root);
    }

    private List<String> getPlayers(Connection conn, String team) throws Exception {
        PreparedStatement ps = conn.prepareStatement(
                "SELECT name FROM players WHERE club = ?"
        );
        ps.setString(1, team);
        ResultSet rs = ps.executeQuery();
        List<String> names = new ArrayList<>();
        while (rs.next()) names.add(rs.getString("name"));
        return names;
    }
}