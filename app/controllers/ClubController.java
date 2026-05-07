package controllers;

import play.libs.Json;
import play.mvc.*;
import models.Club;
import utils.DB;
import com.fasterxml.jackson.databind.JsonNode;

import java.sql.*;
import java.util.*;

public class ClubController extends Controller {

    // CREATE CLUB
    public Result addClub(Http.Request request) {

        JsonNode json = request.body().asJson();

        if (json == null) {
            return badRequest("Invalid JSON");
        }

        try (Connection conn = DB.getConnection()) {

            String sql = "INSERT INTO clubs (name, wins, losses, draws) VALUES (?, ?, ?, ?) RETURNING id";

            PreparedStatement stmt = conn.prepareStatement(sql);

            stmt.setString(1, json.get("name").asText());
            stmt.setInt(2, json.get("wins").asInt());
            stmt.setInt(3, json.get("losses").asInt());
            stmt.setInt(4, json.get("draws").asInt());

            ResultSet rs = stmt.executeQuery();

            long id = 0;
            if (rs.next()) {
                id = rs.getLong("id");
            }

            Club club = new Club();
            club.id = id;
            club.name = json.get("name").asText();
            club.wins = json.get("wins").asInt();
            club.losses = json.get("losses").asInt();
            club.draws = json.get("draws").asInt();

            return ok(Json.toJson(club));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    // GET ALL CLUBS
    public Result getClubs() {

        List<Club> clubs = new ArrayList<>();

        try (Connection conn = DB.getConnection()) {

            String sql = "SELECT * FROM clubs";
            Statement stmt = conn.createStatement();

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                Club club = new Club();
                club.id = rs.getLong("id");
                club.name = rs.getString("name");
                club.wins = rs.getInt("wins");
                club.losses = rs.getInt("losses");
                club.draws = rs.getInt("draws");

                clubs.add(club);
            }

            return ok(Json.toJson(clubs));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}