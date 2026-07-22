// const express = require("express");
// const app = express();
// app.use(express.urlencoded({ extended: true }));

// const port = 5909;

// const cors = require("cors");
// app.use(cors());

// const { Pool } = require("pg");
// const pool = new Pool({
//   user: "user_5909", // PostgreSQLのユーザー名に置き換えてください
//   host: "db",
//   database: "crm_5909", // PostgreSQLのデータベース名に置き換えてください
//   password: "pass_5909", // PostgreSQLのパスワードに置き換えてください
//   port: 5432,
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// app.get("/customers", async (req, res) => {
//   try {
//     const customerData = await pool.query("SELECT * FROM customers");
//     res.send(customerData.rows);
//   } catch (err) {
//     console.error(err);
//     res.send("Error " + err);
//   }
// });

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.post("/add-customer", async (req, res) => {
//   try {
//     const { companyName, industry, contact, location } = req.body;
//     const newCustomer = await pool.query(
//       "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
//       [companyName, industry, contact, location]
//     );
//     res.json({ success: true, customer: newCustomer.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.json({ success: false });
//   }
// });

// app.use(express.static("public"));

const express = require("express");
const app = express();

const port = 5909;

const cors = require("cors");
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_5909",
  host: "db",
  database: "crm_5909",
  password: "pass_5909",
  port: 5432,
});

// ------------------------
// サーバー起動
// ------------------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ------------------------
// 顧客一覧取得
// ------------------------
app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.json(customerData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ------------------------
// 顧客詳細取得
// ------------------------
app.get('/customers/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    const result = await pool.query(
      `
      SELECT *
      FROM customers
      WHERE customer_id = $1
      `,
      [customerId]
    );

    // データが存在しない場合
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ------------------------
// 顧客追加
// ------------------------
app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;

    const newCustomer = await pool.query(
      `INSERT INTO customers
      (company_name, industry, contact, location)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [companyName, industry, contact, location]
    );

    res.json({
      success: true,
      customer: newCustomer.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false
    });
  }
});
// ------------------------
// 顧客削除
// ------------------------
app.delete("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;

    const result = await pool.query(
      `
      DELETE FROM customers
      WHERE customer_id = $1
      RETURNING *
      `,
      [customerId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({
      message: "Customer deleted"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
});
// ------------------------
// 顧客更新
// ------------------------
app.put("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const { companyName, industry, contact, location } = req.body;

    const result = await pool.query(
      `
      UPDATE customers
      SET
        company_name = $1,
        industry = $2,
        contact = $3,
        location = $4
      WHERE customer_id = $5
      RETURNING *
      `,
      [companyName, industry, contact, location, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
});
// ------------------------
// 静的ファイル
// ------------------------
app.use(express.static("public"));