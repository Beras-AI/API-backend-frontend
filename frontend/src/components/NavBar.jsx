import { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import logoNoTtl from "../assets/logo-nottl.png";

import {
  Navbar,
  Container,
  Nav,
  Offcanvas,
  Button,
  Modal,
} from "react-bootstrap";

const NavBar = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function confirmLogout() {
    try {
      setIsLoading(true);
      await axios.delete("http://localhost:5000/logout");
      setIsLoading(false);
      setShowModal(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  function handleLogout() {
    setShowModal(true);
  }

  function cancelLogout() {
    setShowModal(false);
  }

  return (
    <>
      <Navbar bg="light" expand={false}>
        <Container>
          <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
            <img
              src={logoNoTtl}
              alt=""
              width={50}
              height={35}
              className="me-2"
            />
            <span className="h5 mb-0">BerasAi</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                Sidebar
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="d-flex flex-column h-100 justify-content-between">
              <div>
                <Nav className="mt-auto">
                  <NavLink
                    to="/dashboard"
                    activeClassName="active-link"
                    className="nav-link"
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/prices"
                    activeClassName="active-link"
                    className="nav-link"
                  >
                    Prices
                  </NavLink>
                  <NavLink
                    to="/tengkulaks"
                    activeClassName="active-link"
                    className="nav-link"
                  >
                    Tengkulaks
                  </NavLink>
                </Nav>
              </div>
              <div className="text-center">
                <Nav.Link href="#" onClick={handleLogout}>
                  <Button variant="secondary" className="ml-2">
                    <FontAwesomeIcon
                      icon={faRightToBracket}
                      className="btn-icon"
                    />
                  </Button>
                </Nav.Link>
              </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <Modal show={showModal} onHide={cancelLogout}>
        <Modal.Header closeButton>
          <Modal.Title>Logout Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmLogout} disabled={isLoading}>
            {isLoading ? "Loading..." : "Logout"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavBar;
