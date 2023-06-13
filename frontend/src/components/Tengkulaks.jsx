import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const Tengkulaks = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [tengkulaks, setTengkulaks] = useState([]);
  const [expire, setExpire] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [createModal, setcreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [NewTengkulak, setNewTengkulak] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [editTengkulak, setEditTengkulak] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
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
    getTengkulaks();
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

  const getTengkulaks = async () => {
    setLoading(true);
    try {
      const response = await axiosJWT.get(
        "http://localhost:5000/api/tengkulaks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTengkulaks(response.data.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleCreatePrice = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.post(
        "http://localhost:5000/api/tengkulaks",
        NewTengkulak,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewTengkulak({
        name: "",
        address: "",
        phone: "",
      });
      setcreateModal(false);
      getTengkulaks();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowEditModal = (price) => {
    setEditModal(true);
    setEditTengkulak(price);
  };
  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.put(
        `http://localhost:5000/api/tengkulaks/${editTengkulak.id}`,
        editTengkulak,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditTengkulak({
        id: null,
        name: "",
        address: "",
        phone: "",
      });
      setEditModal(false);
      getTengkulaks();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteTengkulak = async () => {
    try {
      await axiosJWT.delete(`http://localhost:5000/api/tengkulaks/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteId(null);
      getTengkulaks();
    } catch (error) {
      console.log(error);
    }
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
                  <h3 className="text-center mt-2">Data table of tengkulaks</h3>
                  <Button
                    variant="primary"
                    onClick={() => setcreateModal(true)}
                    className="my-3"
                  >
                    Create Tengkulak
                  </Button>
                  <Table>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Alamat</th>
                        <th>Link Whatsapp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tengkulaks.length > 0 ? (
                        tengkulaks.map((tengkulak, index) => (
                          <tr key={tengkulak.id}>
                            <td>{index + 1}</td>
                            <td>{tengkulak.name}</td>
                            <td>{tengkulak.address}</td>
                            <td>
                              <Link to={`${tengkulak.phone}`}>
                                {tengkulak.phone}
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={() => handleShowEditModal(tengkulak)}
                                className="btn btn-success me-2 mb-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteId(tengkulak.id)}
                                className="btn btn-danger mb-2"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No tengkulaks found.</td>
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
              <Modal.Title>Create Tengkulak</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreatePrice}>
                <Form.Group controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={NewTengkulak.name}
                    onChange={(e) =>
                      setNewTengkulak({ ...NewTengkulak, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="formAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter address"
                    value={NewTengkulak.address}
                    onChange={(e) =>
                      setNewTengkulak({
                        ...NewTengkulak,
                        address: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group controlId="formPhone">
                  <Form.Label>Link Whatsapp</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter link whatsapp"
                    value={NewTengkulak.phone}
                    onChange={(e) =>
                      setNewTengkulak({
                        ...NewTengkulak,
                        phone: e.target.value,
                      })
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
              <Modal.Title>Edit Tengkulak</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdatePrice}>
                <Form.Group controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={editTengkulak.name}
                    onChange={(e) =>
                      setEditTengkulak({
                        ...editTengkulak,
                        name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="formAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter address"
                    value={editTengkulak.address}
                    onChange={(e) =>
                      setEditTengkulak({
                        ...editTengkulak,
                        address: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group controlId="formPhone">
                  <Form.Label>Link whatsapp</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter link whatsapp"
                    value={editTengkulak.phone}
                    onChange={(e) =>
                      setEditTengkulak({
                        ...editTengkulak,
                        phone: e.target.value,
                      })
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
              <Modal.Title>Delete Tengkulak</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure want to delete this item?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteTengkulak}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : null}
    </>
  );
};

export default Tengkulaks;
