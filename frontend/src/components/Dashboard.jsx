import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import axios from "axios";
import jwt_decode from "jwt-decode";
import NavBar from "./NavBar";
import { Spinner, Container } from "react-bootstrap";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState([]);
  const navigate = useNavigate();

  const checkToken = async () => {
    try {
      const response = await axios.get("http://localhost:5000/token");
      const data = response.data.data;
      setToken(data.accessToken);
      const decoded = jwt_decode(data.accessToken);
      setName(decoded.name);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(async (config) => {
    const currentDate = new Date();
    if (expire * 1000 < currentDate.getTime()) {
      const response = await axios.get("http://localhost:5000/token");
      const data = response.data.data;
      const decoded = jwt_decode(data.accessToken);
      config.headers.Authorization = `Bearer ${data.accessToken}`;
      setToken(data.accessToken);
      setName(decoded.name);
      setExpire(decoded.exp);
    }
    return config;
  });

  useEffect(() => {
    checkToken();

    // Fetch data for the chart
    async function fetchData() {
      setLoading(true);
      try {
        const response = await axiosJWT.get("http://localhost:5000/api/prices");
        const data = response.data.data;
        const priceArr = data.map((priceData) => ({
          province: priceData.province,
          price: priceData.price,
        }));

        const priceByProvince = priceArr.reduce((acc, curr) => {
          if (!acc[curr.province]) {
            acc[curr.province] = [];
          }
          acc[curr.province].push(curr.price);
          return acc;
        }, {});

        const averagePriceByProvince = Object.entries(priceByProvince).map(
          ([province, prices]) => ({
            province,
            averagePrice:
              prices.reduce((acc, curr) => acc + curr) / prices.length,
          })
        );

        const sortedPrice = averagePriceByProvince.sort((a, b) =>
          a.province.localeCompare(b.province)
        );
        setPriceData(sortedPrice);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    createChart(priceData);
  }, [priceData]);

  function createChart(data) {
    const pricesByProvince = data.map((item) => item.averagePrice);
    const provinces = data.map((item) => item.province);

    const ctx = document.getElementById("myChart");
    if (!ctx) return;

    // Check if a previous chart instance exists and destroy it
    if (ctx.chart) {
      ctx.chart.destroy();
    }

    // Create a new chart instance
    ctx.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: provinces,
        datasets: [
          {
            label: "Average Prices by Province",
            data: pricesByProvince,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              ticks: {
                maxRotation: 90,
                minRotation: 90,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  return (
    <>
      {token ? (
        <>
          <NavBar />
          <Container>
            {isLoading ? (
              <div className="loading-container">
                <Spinner animation="border" role="status" className="spinner">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <div className="mt-4">
                <canvas id="myChart"></canvas>
              </div>
            )}
          </Container>
        </>
      ) : null}
    </>
  );
};

export default Dashboard;
