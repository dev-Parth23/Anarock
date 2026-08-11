"use strict";
const express = require("express");
const catalyst = require("zcatalyst-sdk-node");
const app = express();

app.use(express.json());
function escapeZCQL(value) {
  return String(value).replace(/'/g, "''");
}

app.get("/properties", async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);
    const offset = (page - 1) * limit;
    const city = req.query.city?.trim();
    const micromarket = req.query.micromarket?.trim();
    let query = `
            SELECT
                Properties.*,
                Micromarket.Micromarket,
                City.City,
                City.Region
            FROM Properties
            INNER JOIN Micromarket
                ON Properties.Micromarket = Micromarket.ROWID
            INNER JOIN City
                ON Properties.City = City.ROWID
        `;
    const conditions = [];
    if (city) {
      conditions.push(`City.City = '${escapeZCQL(city)}'`);
    }
    if (micromarket) {
      conditions.push(`Micromarket.Micromarket = '${escapeZCQL(micromarket)}'`);
    }
    if (conditions.length > 0) {
      query += `
                WHERE ${conditions.join(" AND ")}
            `;
    }
    query += `
            ORDER BY Properties.CREATEDTIME DESC
            LIMIT ${offset}, ${limit}
        `;

    console.log("Executing query:");
    console.log(query);

    const result = await catalystApp.zcql().executeZCQLQuery(query);
    const properties = result.map((item) => {
      const property = item.Properties || {};
      const micro = item.Micromarket || {};
      const cityData = item.City || {};

      return {
        ROWID: property.ROWID,
        PropertyName: property.PropertyName,
        AvailabilityType: property.AvailabilityType,
        OfficeType: property.OfficeType,
        ImageFolderPath: property.ImageFolderPath,
        CreatedTime: property.CREATEDTIME,
        ModifiedTime: property.MODIFIEDTIME,
        Micromarket: {
          ROWID: micro.ROWID,
          name: micro.Micromarket,
        },

        City: {
          ROWID: cityData.ROWID,
          name: cityData.City,
          region: cityData.Region,
        },
      };
    });
    res.status(200).json({
      status: "success",

      pagination: {
        page,
        limit,
        offset,
        count: properties.length,
        hasNext: properties.length === limit,
        hasPrevious: page > 1,
      },

      filters: {
        city: city || null,

        micromarket: micromarket || null,
      },

      data: properties,
    });
  } catch (error) {
    console.error("Properties API Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
});

app.get("/properties/:id", async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const propertyId = req.params.id;
    const query = `
            SELECT
                Properties.*,
                Micromarket.Micromarket,
                City.City,
                City.Region
            FROM Properties
            INNER JOIN Micromarket
                ON Properties.Micromarket = Micromarket.ROWID
            INNER JOIN City
                ON Properties.City = City.ROWID
            WHERE Properties.ROWID = '${escapeZCQL(propertyId)}'
        `;

    console.log("Property detail query:");
    console.log(query);
    const result = await catalystApp.zcql().executeZCQLQuery(query);
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "error",

        message: "Property not found",
      });
    }
    const item = result[0];
    const property = item.Properties || {};
    const micro = item.Micromarket || {};
    const cityData = item.City || {};
    const formattedProperty = {
      ROWID: property.ROWID,
      PropertyName: property.PropertyName,
      AvailabilityType: property.AvailabilityType,
      OfficeType: property.OfficeType,
      ImageFolderPath: property.ImageFolderPath,
      CreatedTime: property.CREATEDTIME,

      ModifiedTime: property.MODIFIEDTIME,

      Micromarket: {
        ROWID: micro.ROWID,

        name: micro.Micromarket,
      },

      City: {
        ROWID: cityData.ROWID,

        name: cityData.City,

        region: cityData.Region,
      },
    };

    res.status(200).json({
      status: "success",

      data: formattedProperty,
    });
  } catch (error) {
    console.error("Property detail error:", error);

    res.status(500).json({
      status: "error",

      message: "Failed to fetch property",

      error: error.message,
    });
  }
});

app.get("/cities", async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);

    const query = `
            SELECT
                City.*
            FROM City
            ORDER BY City.City ASC
        `;

    const result = await catalystApp.zcql().executeZCQLQuery(query);

    const cities = result.map((item) => {
      return item.City;
    });

    res.status(200).json({
      status: "success",

      data: cities,
    });
  } catch (error) {
    console.error("Cities API error:", error);

    res.status(500).json({
      status: "error",

      message: "Failed to fetch cities",
    });
  }
});

app.get("/micromarkets", async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);

    const city = req.query.city?.trim();

    let query = `
            SELECT
                Micromarket.*,
                City.City
            FROM Micromarket
            INNER JOIN City
                ON Micromarket.City = City.ROWID
        `;

    if (city) {
      query += `
                WHERE City.City = '${escapeZCQL(city)}'
            `;
    }

    query += `
            ORDER BY Micromarket.Micromarket ASC
        `;

    const result = await catalystApp.zcql().executeZCQLQuery(query);

    const micromarkets = result.map((item) => {
      const micro = item.Micromarket || {};
      const cityData = item.City || {};

      return {
        ROWID: micro.ROWID,

        name: micro.Micromarket,

        city: cityData.City,
      };
    });

    res.status(200).json({
      status: "success",

      data: micromarkets,
    });
  } catch (error) {
    console.error("Micromarket API error:", error);

    res.status(500).json({
      status: "error",

      message: "Failed to fetch micromarkets",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "success",

    message: "Anarock function is running",
  });
});

module.exports = app;
