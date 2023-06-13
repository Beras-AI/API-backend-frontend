import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logoNoTtl from "../assets/logo-nottl.png";
import logoWthTtl from "../assets/logo-wthttl.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const navigate = useNavigate();

  const Auth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/login", {
        email: email,
        password: password,
      });
      navigate("/dashboard");
    } catch (error) {
        if (error.response) {
            setMessage(error.response.data.message);
        }
    }
    setLoading(false);
  };
  return (
    <div>
      <div className="vh-100">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card" style={{ borderRadius: "1rem" }}>
                <div className="row g-0">
                  <div className="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src={logoWthTtl}
                      alt="login form"
                      className="img-fluid"
                      style={{ borderRadius: "1rem 0 0 1rem" }}
                    />
                  </div>
                  <div className="col-md-6 col-lg-7 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5 text-black">
                      <div className="d-flex d-md-none align-items-center justify-content-center mb-4 pb-1">
                        <img
                          src={logoNoTtl}
                          alt=""
                          style={{ width: "30%" }}
                        />
                      </div>
                      <h5
                        className="fw-normal mb-3 pb-3 text-center"
                        style={{ letterSpacing: "2px" }}
                      >
                        LOGIN ADMIN
                      </h5>
                      {message && (
                        <div className="alert alert-danger" role="alert">
                          {message}
                        </div>
                      )}
                      <form onSubmit={Auth}>
                        <div className="form-outline mb-4">
                          <input
                            type="email"
                            id="inputEmail"
                            className="form-control form-control-lg"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <label className="form-label" htmlFor="inputEmail">
                            Email address
                          </label>
                        </div>

                        <div className="form-outline mb-4">
                          <input
                            type="password"
                            id="inputPassword"
                            className="form-control form-control-lg"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <label className="form-label" htmlFor="inputPassword">
                            Password
                          </label>
                        </div>

                        <div className="pt-1 mb-4">
                          <button
                            className="btn btn-dark btn-lg btn-block"
                            type="submit"
                            disabled={isLoading}
                          >
                            {isLoading && (
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            )}
                            Login
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
