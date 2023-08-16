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
app.use(cors());
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
  const result = await client.query(`SELECT * FROM public."hanTech_data"`);

  res.json(result.rows);
  client.release();
});

app.post("/post/create", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    `INSERT INTO public."hanTech_post" (post_id,title,nickname, content, id) VALUES ($1, $2,$3,$4,$5)`,
    [
      req.body.post_id,
      req.body.title,
      req.body.nickname,
      req.body.content,
      req.body.id,
    ]
  );

  process.on("uncaughtException", (err) => {
    console.log("whoops! there was an error");
    console.log(err);
  });

  res.json(result.rows);
  client.release();
});

app.post("/post/edit", async (req, res) => {
  const client = await pool.connect();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const timestamp =
    year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  const result = await client.query(
    `UPDATE public."hanTech_post" SET title = $1, content = $2, nickname = $4, id=$5, uploaded_at=$6 WHERE post_id = $3`,
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
});

app.get("/post", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(`SELECT * FROM public."hanTech_post"`);

  res.json(result.rows);
  client.release();
});

// 특정 게시물 조회 API
app.get("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;
  const client = await pool.connect();

  try {
    const query = 'SELECT * FROM public."hanTech_post" WHERE post_id = $1';
    const result = await client.query(query, [postId]);

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
  const result = await client.query(
    `DELETE FROM public."hanTech_post" WHERE post_id = $1`,
    [req.body.post_id]
  );

  res.json(result.rows);
  client.release();
});

// 게시글 조회수 증가
app.post("/post/increase-views", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    `UPDATE public."hanTech_post" SET view_count = view_count + 1 WHERE post_id = $1`,
    [req.body.post_id]
  );

  res.json(result.rows);
  client.release();
});

// 댓글 생성
app.post("/comment/create/:post_Id", async (req, res) => {
  const postId = req.params.post_Id;
  const client = await pool.connect();
  const result = await client.query(
    `INSERT INTO public."hanTech_comment" (nickname, content, id, post_id) VALUES ($1, $2,$3,$4)`,
    [req.body.nickname, req.body.content, req.body.id, postId]
  );

  process.on("uncaughtException", (err) => {
    console.log("whoops! there was an error");
    console.log(err);
  });

  res.json(result.rows);
  client.release();
});

// 댓글 수정
app.post("/comment/edit", async (req, res) => {
  const client = await pool.connect();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const timestamp =
    year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  const result = await client.query(
    `UPDATE public."hanTech_comment" SET content = $1, uploaded_at=$3 WHERE comment_id = $2ss`,
    [req.body.content, req.body.comment_id, timestamp]
  );

  res.json(result.rows);
  client.release();
});

//댓글 삭제
app.delete("/comment/delete", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    `DELETE FROM public."hanTech_comment" WHERE comment_id = $1`,
    [req.body.comment_id]
  );

  res.json(result.rows);
  client.release();
});

app.get("/comment", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(`SELECT * FROM public."hanTech_comment"`);

  res.json(result.rows);
  client.release();
});

// 댓글 조회
app.get("/comment/check", async (req, res) => {
  const client = await pool.connect();
  const post_id = req.body.post_id;
  const result = await client.query(
    `SELECT * FROM public."hanTech_comment" WHERE comment_id = $1`,
    [post_id]
  );

  res.json(result.rows);
  client.release();
});

//현재 시각의 데이터 조회
app.get("/data/now", async (req, res) => {
  const client = await pool.connect();
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const time = hour + ":" + minute + ":" + second;
  console.log(time);

  const result = await client.query(
    `SELECT * FROM public."hanTech_data" WHERE time >= $1::time-'00:05:00' AND time < $1::time +'00:05:00' `,
    [time]
  );
  res.json(result.rows);
  client.release();
});
