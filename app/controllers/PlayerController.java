package controllers;

import play.libs.Json;
import play.mvc.*;
import utils.DB;
import models.Player;
import com.fasterxml.jackson.databind.JsonNode;

import java.sql.*;
import java.util.*;

public class PlayerController extends Controller {

    // CREATE PLAYER
    public Result addPlayer(Http.Request request) {

        JsonNode json = request.body().asJson();

        if (json == null) {
            return badRequest("Invalid JSON");
        }

        try (Connection conn = DB.getConnection()) {

            String sql = "INSERT INTO players (name, club, position, rating) VALUES (?, ?, ?, ?) RETURNING id";

            PreparedStatement stmt = conn.prepareStatement(sql);

            stmt.setString(1, json.get("name").asText());
            stmt.setString(2, json.get("club").asText());
            stmt.setString(3, json.get("position").asText());
            stmt.setInt(4, json.get("rating").asInt());

            ResultSet rs = stmt.executeQuery();

            long id = 0;
            if (rs.next()) {
                id = rs.getLong("id");
            }

            Player p = new Player();
            p.id = id;
            p.name = json.get("name").asText();
            p.club = json.get("club").asText();
            p.position = json.get("position").asText();
            p.rating = json.get("rating").asInt();

            return ok(Json.toJson(p));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    // GET ALL PLAYERS
    public Result getPlayers() {

        List<Player> players = new ArrayList<>();

        try (Connection conn = DB.getConnection()) {

            String sql = "SELECT * FROM players";
            Statement stmt = conn.createStatement();

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                Player p = new Player();
                p.id = rs.getLong("id");
                p.name = rs.getString("name");
                p.club = rs.getString("club");
                p.position = rs.getString("position");
                p.rating = rs.getInt("rating");

                players.add(p);
            }

            return ok(Json.toJson(players));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}