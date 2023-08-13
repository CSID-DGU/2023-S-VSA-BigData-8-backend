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
    `INSERT INTO public."hanTech_post" (post_id,title,nickname, content, updated_at,uploaded_at,id,view_count) VALUES ($1, $2,$3,$4,$5,$6,$7,$8)`,
    [
      req.body.post_id,
      req.body.title,
      req.body.nickname,
      req.body.content,
      req.body.updated_at,
      req.body.uploaded_at,
      req.body.id,
      req.body.view_count,
    ]
  );

  res.json(result.rows);
  client.release();
});

app.post("/post/edit", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    `UPDATE public."hanTech_post" SET title = $1, content = $2, nickname = $4, updated_at=$5,uploaded_at=$6,id=$7,view_count=$8 WHERE post_id = $3`,
    [
      req.body.title,
      req.body.content,
      req.body.post_id,
      req.body.nickname,
      req.body.updated_at,
      req.body.uploaded_at,
      req.body.id,
      req.body.view_count,
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

app.get("/post/check", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(`SELECT * FROM public."hanTech_post"`);

  res.json(result.rows);
  client.release();
});

app.get("/post/find", async (req, res) => {
  const client = await pool.connect();
  const post_id = req.body.post_id;
  const result = await client.query(
    `SELECT * FROM public."hanTech_post" WHERE post_id = $1`,
    [post_id]
  );

  res.json(result.rows);
  client.release();
}); // 게시글 조회

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
app.post("/comment/create", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    `INSERT INTO public."hanTech_comment" (nickname, content, updated_at,uploaded_at,id,comment_id) VALUES ($1, $2,$3,$4,$5,$6)`,
    [
      req.body.nickname,
      req.body.content,
      req.body.updated_at,
      req.body.uploaded_at,
      req.body.id,
      req.body.comment_id,
    ]
  );

  res.json(result.rows);
  client.release();
});

// 댓글 수정
app.post("/comment/edit", async (req, res) => {
  const client = await pool.connect();
  const result = await client.query(
    `UPDATE public."hanTech_comment" SET nickname = $1, content = $2, updated_at=$3, uploaded_at=$4, id=$5, comment_id=$6 WHERE comment_id = $3`,
    [
      req.body.nickname,
      req.body.content,
      req.body.comment_id,
      req.body.updated_at,
      req.body.uploaded_at,
      req.body.id,
    ]
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
  const comment_id = req.body.comment_id;
  const result = await client.query(
    `SELECT * FROM public."hanTech_comment" WHERE comment_id = $1`,
    [comment_id]
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
