import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

dotenv.config();

const pool = new pg.Pool({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

app.listen(5001, () => {
  console.log("Server Open!");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/child", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM public."hanTech_data"`);

    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching hantech data:", err);
    res

      .status(500)
      .json({ error: "An error occurred while fetching the hantech data." });
  }
});

app.post("/post/create", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO public."hanTech_post" (title,nickname, content, id) VALUES ($1, $2,$3,$4)`,
      [req.body.title, req.body.nickname, req.body.content, req.body.id]
    );

    res.json(result.rows.sort((a, b) => b.post_id - a.post_id)[0]);
    client.release();
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post." });
  }
});

app.post("/post/edit", async (req, res) => {
  const client = await pool.connect();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const timestamp =
    year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  try {
    const result = await client.query(
      `UPDATE public."hanTech_post" SET title = $1, content = $2, nickname = $4, id=$5, updated_at=$6 WHERE post_id = $3`,
      [
        req.body.title,
        req.body.content,
        req.body.post_id,
        req.body.nickname,
        req.body.id,
        timestamp,
      ]
    );

    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post." });
  }
});

app.get("/post", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM public."hanTech_post"`);
    res.json(result.rows.sort((a, b) => b.post_id - a.post_id));
    client.release();
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post." });
  }
});

// 특정 게시물 조회 API
app.get("/post/check", async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM public."hanTech_post" WHERE post_id = $1`,
      [req.query.post_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Post not found." });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post." });
  }
});

app.delete("/post/delete", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM public."hanTech_comment" WHERE post_id = $1`,
      [req.query.post_id]
    );
    const result2 = await client.query(
      `DELETE FROM public."hanTech_post" WHERE post_id = $1`,
      [req.query.post_id]
    );
    res.json(result2.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post." });
  }
});

// 게시글 조회수 증가
app.post("/post/increase-views", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE public."hanTech_post" SET view_count = view_count + 1 WHERE post_id = $1`,
      [req.body.post_id]
    );
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the post." });
  }
});

// 댓글 생성
app.post("/comment/create", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO public."hanTech_comment" (nickname, content, id, post_id) VALUES ($1, $2,$3,$4)`,
      [req.body.nickname, req.body.content, req.body.id, req.body.post_id]
    );
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching comment:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the comment." });
  }
});

// 댓글 수정
app.post("/comment/edit", async (req, res) => {
  const client = await pool.connect();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const timestamp =
    year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  try {
    const result = await client.query(
      `UPDATE public."hanTech_comment" SET content = $1, updated_at=$3 WHERE comment_id = $2`,
      [req.body.content, req.body.comment_id, timestamp]
    );

    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching comment:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the comment." });
  }
});

//댓글 삭제
app.delete("/comment/delete", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM public."hanTech_comment" WHERE comment_id = $1`,
      [req.query.comment_id]
    );
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching comment:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the comment." });
  }
});

app.get("/comment", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM public."hanTech_comment"`);
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching comment:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the comment." });
  }
});

// 댓글 조회
app.get("/comment/check", async (req, res) => {
  const client = await pool.connect();
  const post_id = req.query.post_id;
  try {
    const result = await client.query(
      `SELECT * FROM public."hanTech_comment" WHERE post_id = $1`,
      [post_id]
    );

    res.json(result.rows.sort((a, b) => b.comment_id - a.comment_id));
    client.release();
  } catch (err) {
    console.error("Error fetching comment:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the comment." });
  }
});

//현재 시각의 데이터 조회
app.get("/data/now", async (req, res) => {
  const region = req.query.region;
  const client = await pool.connect();
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const time = hour + ":" + minute + ":" + second;
  console.log(time);
  try {
    const result = await client.query(
      `SELECT *
      FROM public."hanTech_data"
      WHERE 
          time = $1 - $3::int % 10 * interval '1 minute' - $4::int * interval '1 second'
          AND name = $2`,
      [time, region, minute, second]
    );
    let Car = result.rows[0].car_count;
    let People = result.rows[0].people_count;
    let Car_speed_max = result.rows[0].car_speed_max;
    let Car_speed_avg = result.rows[0].car_speed_mean;
    let Safety =
      10000000 / ((Car + 1) * (People + 1) * (Car_speed_max + Car_speed_avg));
    function truncateDecimal(number) {
      return parseInt(number, 10);
    }
    for (let i = 0; i < Safety.length; i++) {
      Safety[i] = truncateDecimal(Safety[i]);
    }
    res.json(result.rows[0]);
    console.log(
      result.rows[0].time,
      result.rows[0].name,
      result.rows[0].car_count,
      result.rows[0].car_speed_max,
      result.rows[0].car_speed_mean,
      result.rows[0].people_count,
      Safety
    );
    client.release();
  } catch (err) {
    console.error("Error fetching hantech data:", err);
    res

      .status(500)
      .json({ error: "An error occurred while fetching the hantech data." });
  }
});

//6시부터 지금시간까지의 데이터 조회
app.get("/data/accumulate", async (req, res) => {
  const region = req.query.region;
  const client = await pool.connect();
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const time = hour + ":" + minute + ":" + second;
  console.log(time);
  try {
    const result = await client.query(
      `SELECT * FROM public."hanTech_data" WHERE time <=$1 AND name = $2`,
      [time, region]
    );
    const Safety = [];
    for (let i = 0; i < result.rows.length; i++) {
      let Car = result.rows[i].car_count;
      let People = result.rows[i].people_count;
      let Car_speed_max = result.rows[i].car_speed_max;
      let Car_speed_avg = result.rows[i].car_speed_mean;
      Safety.push(
        1000000 / ((Car + 1) * (People + 1) * (Car_speed_max + Car_speed_avg))
      );
    }
    function truncateDecimal(number) {
      return parseInt(number, 10);
    }
    for (let i = 0; i < Safety.length; i++) {
      Safety[i] = truncateDecimal(Safety[i]);
    }
    for (let i = 0; i < result.rows.length; i++) {
      result.rows[i].safety = Safety[i];
    }
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching hantech data:", err);
    res

      .status(500)
      .json({ error: "An error occurred while fetching the hantech data." });
  }
});

//오늘최고속도, 누적보행자수, 누적차량수
app.get("/data/nowTotal", async (req, res) => {
  const region = req.query.region;
  const client = await pool.connect();
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const time = hour + ":" + minute + ":" + second;
  const result = await client.query(
    `SELECT * FROM public."hanTech_data" WHERE time <=$1 AND name = $2`,
    [time, region]
  );
  const sortedRows = result.rows.sort(
    (a, b) => b.car_speed_max - a.car_speed_max
  );
  const today_max = sortedRows[0].car_speed_max; // 가장 큰 최대 속도 값
  let car_total = 0;
  for (let i = 0; i < result.rows.length; i++) {
    car_total = car_total + result.rows[i].car_count;
  }
  let people_total = 0;
  for (let i = 0; i < result.rows.length; i++) {
    people_total = people_total + result.rows[i].people_count;
  }
  res.json({
    today_max: today_max,
    car_total: car_total,
    people_total: people_total,
  });
  client.release();
});
