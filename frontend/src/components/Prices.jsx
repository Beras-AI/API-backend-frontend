import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import NavBar from "./NavBar";
import {
  Spinner,
  Table,
  Container,
  Modal,
  Form,
  Button,
} from "react-bootstrap";

const Prices = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [prices, setPrices] = useState([]);
  const [expire, setExpire] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [createModal, setcreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [NewPrice, setNewPrice] = useState({
    province: "",
    price: "",
  });
  const [editPrice, setEditPrice] = useState({
    id: null,
    province: "",
    price: "",
  });
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
  useEffect(() => {
    checkToken();
    getPrices();
  }, []);

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
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
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getPrices = async () => {
    setLoading(true);
    try {
      const response = await axiosJWT.get("http://localhost:5000/api/prices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrices(response.data.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleCreatePrice = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.post("http://localhost:5000/api/prices", NewPrice, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewPrice({
        province: "",
        price: "",
      });
      setcreateModal(false);
      getPrices();
    } catch (error) {
      console.log(error);
    }
  };
  const handleShowEditModal = (price) => {
    setEditModal(true);
    setEditPrice(price);
  };
  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.put(
        `http://localhost:5000/api/prices/${editPrice.id}`,
        editPrice,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditPrice({
        id: null,
        province: "",
        price: "",
      });
      setEditModal(false);
      getPrices();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeletePrice = async () => {
    try {
      await axiosJWT.delete(`http://localhost:5000/api/prices/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteId(null);
      getPrices();
    } catch (error) {
      console.log(error);
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <>
      {token ? (
        <>
          <NavBar />
          <div>
            {isLoading ? (
              <div className="loading-container">
                <Spinner animation="border" role="status" className="spinner">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <Container>
                  <h3 className="text-center mt-2">Price table of rice</h3>
                  <Button
                    variant="primary"
                    onClick={() => setcreateModal(true)}
                    className="my-3"
                  >
                    Create Price
                  </Button>
                  <Table>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Province</th>
                        <th>Price</th>
                        <th>Day</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.length > 0 ? (
                        prices.map((price, index) => (
                          <tr key={price.id}>
                            <td>{index + 1}</td>
                            <td>{price.province}</td>
                            <td>{formatRupiah(price.price)}</td>
                            <td>
                              {new Date(
                                price.updatedAt._seconds * 1000
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                            <td>
                              <button
                                onClick={() => handleShowEditModal(price)}
                                className="btn btn-success me-2 mb-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteId(price.id)}
                                className="btn btn-danger mb-2"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No prices found.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Container>
              </>
            )}
          </div>
          <Modal show={createModal} onHide={() => setcreateModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Create Price</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreatePrice}>
                <Form.Group controlId="formProvince">
                  <Form.Label>Province</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter province"
                    value={NewPrice.province}
                    onChange={(e) =>
                      setNewPrice({ ...NewPrice, province: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="formPrice">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    value={NewPrice.price}
                    onChange={(e) =>
                      setNewPrice({ ...NewPrice, price: e.target.value })
                    }
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-2">
                  Create
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal show={editModal} onHide={() => setEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Price</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdatePrice}>
                <Form.Group controlId="formProvince">
                  <Form.Label>Province</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter province"
                    value={editPrice.province}
                    onChange={(e) =>
                      setEditPrice({ ...editPrice, province: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="formPrice">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    value={editPrice.price}
                    onChange={(e) =>
                      setEditPrice({ ...editPrice, price: e.target.value })
                    }
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-2">
                  Update
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal show={deleteId !== null} onHide={() => setDeleteId(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Price</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure want to delete this item?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeletePrice}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : null}
    </>
  );
};

export default Prices;
