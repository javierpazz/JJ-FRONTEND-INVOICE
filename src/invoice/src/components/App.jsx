import { useContext, useState, useRef, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClientDetails from './ClientDetails';
import Dates from './Dates';
import Footer from './Footer';
import Header from './Header';
import MainDetails from './MainDetails';
import Notes from './Notes';
import Table from './Table';
import { toast } from 'react-toastify';
import TableForm from './TableForm';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Store } from '../../../Store';
import ReactToPrint from 'react-to-print';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../../../components/LoadingBox';
import { getError, API } from '../../../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'VALUE_FETCH_REQUEST':
      return { ...state, loadingVal: true };
    case 'VALUE_FETCH_SUCCESS':
      return {
        ...state,
        values: action.payload.values,
        pageVal: action.payload.page,
        pagesVal: action.payload.pages,
        loadingVal: false,
      };
    case 'VALUE_FETCH_FAIL':
      return { ...state, loadingVal: false, error: action.payload };
    default:
      return state;
  }
};

function App() {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingVal,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    loadingVal: true,
    error: '',
  });

  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    invoice: { orderItems },
    receipt: { receiptItems },
  } = state;

  const { invoice, receipt, userInfo, values } = state;

  // const [codUse, setCodUse] = useState('');
  const [codCus, setCodCus] = useState('');
  const [name, setName] = useState('');
  const [remNum, setRemNum] = useState('');
  const [invNum, setInvNum] = useState('');
  const [invDat, setInvDat] = useState('12/12/12');
  const [recNum, setRecNum] = useState('');
  const [recDat, setRecDat] = useState('12/12/12');
  const [codVal, setCodVal] = useState('');
  const [codval, setCodval] = useState('');
  const [desval, setDesval] = useState('');
  const [valueeR, setValueeR] = useState('');
  const [desVal, setDesVal] = useState('');
  const [numval, setNumval] = useState(' ');
  // const [userss, setUserss] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [valuess, setValuess] = useState([]);
  const [codPro, setCodPro] = useState('');
  const [address, setAddress] = useState('Direccion Usuario');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [website, setWebsite] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [dueDat, setDueDat] = useState('');
  const [notes, setNotes] = useState('');
  const [desPro, setDesPro] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [amountval, setAmountval] = useState(0);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [width] = useState(641);
  const [showInvoice, setShowInvoice] = useState(false);

  const [isPaying, setIsPaying] = useState(false);

  const invoicegpt = {
    cuit: "30-12345678-9",
    salePoint: "0001",
    invoiceNumber: "00000001",
    date: "2025-02-24",
    client: {
      name: "Juan Pérez",
      cuit: "20-87654321-5",
      address: "Av. Siempre Viva 742, Buenos Aires",
      ivaCondition: "Responsable Inscripto",
    },
    items: [
      { id: 1, description: "Notebook", quantity: 1, price: 150000, iva: 21 },
      { id: 2, description: "Mouse Inalámbrico", quantity: 1, price: 5000, iva: 21 },
    ],

  };

  const componentRef = useRef();
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const calculateAmountval = (amountval) => {
      setAmountval(
        orderItems?.reduce((a, c) => a + c.quantity * c.price, 0) * 1.15
      );
    };
    if (numval === '') {
      setNumval(' ');
    }
    setCodCus(codCus);
    setDesVal(desVal);
    calculateAmountval(amountval);
    addToCartHandler(valueeR);
  }, [orderItems, numval, desval, recNum, recDat]);

  useEffect(() => {
    clearitems();
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API}/api/customers/`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setCustomers(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataVal = async () => {
      try {
        const { data } = await axios.get(`${API}/api/valuees/`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setValuess(data);
        dispatch({ type: 'VALUE_FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchDataVal();
  }, []);

  useEffect(() => {
    if (window.innerWidth < width) {
      alert('Place your phone in landscape mode for the best experience');
    }
  }, [width]);


  const getTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);
  };

  const getIVA = () => {
    return orderItems.reduce((acc, item) => acc + (item.quantity * item.price * 15) / 100, 0).toFixed(2);
  };

  const getTotalWithIVA = () => {
    return (parseFloat(getTotal()) + parseFloat(getIVA())).toFixed(2);
  };




  const searchUser = (codCus) => {
    const usersRow = customers.find((row) => row._id === codCus);
    setCodCus(usersRow._id);
    setName(usersRow.nameCus);
  };

  const handleChange = (e) => {
    searchUser(e.target.value);
  };

  const searchValue = (codVal) => {
    const valuesRow = valuess.find((row) => row._id === codVal);
    setValueeR(valuesRow);
    setCodVal(valuesRow.codVal);
    setCodval(valuesRow.codVal);
    setDesVal(valuesRow.desVal);
    setDesval(valuesRow.desVal);
  };

  const handleValueChange = (e) => {
    searchValue(e.target.value);
  };

  const placeCancelInvoiceHandler = async () => {};

  const placeInvoiceHandler = async () => {
    if (isPaying && (!recNum || !recDat || !desVal)) {
      unloadpayment();
    } else {
      if (invNum && invDat && codCus) {
        orderItems.map((item) => stockHandler({ item }));
        const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
        invoice.subTotal = round2(
          invoice.orderItems.reduce((a, c) => a + c.quantity * c.price, 0)
        );
        invoice.shippingPrice = 0;

        //        invoice.shippingPrice =
        //        invoice.subTotal > 100 ? round2(0) : round2(10);
        invoice.tax = round2(0.15 * invoice.subTotal);
        invoice.total =
          invoice.subTotal + invoice.shippingPrice + invoice.tax;
        invoice.totalBuy = 0;
        invoice.codCus = codCus;
        invoice.codCon = userInfo.codCon;

        invoice.codSup = '0';
        invoice.remNum = remNum;
        invoice.invNum = invNum;
        invoice.invDat = invDat;
        invoice.recNum = recNum;
        invoice.recDat = recDat;
        invoice.desVal = desVal;
        invoice.notes = notes;

        if (recNum && recDat && desVal) {
          receipt.subTotal = invoice.subTotal;
          receipt.total = invoice.total;
          receipt.totalBuy = invoice.totalBuy;
          receipt.codCus = invoice.codCus;
          receipt.codCon = invoice.codCon;
          receipt.codSup = '0';
          receipt.recNum = invoice.recNum;
          receipt.recDat = invoice.recDat;
          receipt.desVal = invoice.desVal;
          receipt.notes = invoice.notes;

          receiptHandler();
        }
        orderHandler();
        setShowInvoice(true);
        //      handlePrint();
      }
    }
  };

  /////////////////////////////////////////////

  const addToCartHandler = async (itemVal) => {
    ctxDispatch({
      type: 'RECEIPT_CLEAR',
    });
    localStorage.removeItem('receiptItems');
    ctxDispatch({
      type: 'RECEIPT_ADD_ITEM',
      payload: { ...itemVal, desval, amountval, numval },
    });
  };

  /////////////////////////////////////////////

  const receiptHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        `${API}/api/receipts`,
        {
          receiptItems: receipt.receiptItems,
          shippingAddress: receipt.shippingAddress,
          paymentMethod: receipt.paymentMethod,
          subTotal: receipt.subTotal,
          shippingPrice: receipt.shippingPrice,
          tax: receipt.tax,
          total: receipt.total,
          totalBuy: receipt.totalBuy,

          codCus: receipt.codCus,
          codCon: receipt.codCon,

          //          codSup: receipt.codSup,

          remNum: receipt.remNum,
          invNum: receipt.invNum,
          invDat: receipt.invDat,
          recNum: receipt.recNum,
          recDat: receipt.recDat,
          desval: receipt.desval,
          notes: receipt.notes,
          salbuy: 'SALE',
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'RECEIPT_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('receiptItems');
      //navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  /////////////////////////////////////////////

  const stockHandler = async (item) => {
    // console.log(item.item._id);

    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.put(
        `${API}/api/products/downstock/${item.item._id}`,
        {
          quantitys: item.item.quantity,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  const orderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        `${API}/api/invoices`,

        {
          orderItems: invoice.orderItems,
          shippingAddress: invoice.shippingAddress,
          paymentMethod: invoice.paymentMethod,
          subTotal: invoice.subTotal,
          shippingPrice: invoice.shippingPrice,
          tax: invoice.tax,
          total: invoice.total,
          totalBuy: invoice.totalBuy,

          codCus: invoice.codCus,
          codCon: invoice.codCon,

          //        codSup: invoice.codSup,

          remNum: invoice.remNum,
          invNum: invoice.invNum,
          invDat: invoice.invDat,
          recNum: invoice.recNum,
          recDat: invoice.recDat,
          desVal: invoice.desVal,
          notes: invoice.notes,
          salbuy: 'SALE',
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      //ctxDispatch({ type: 'INVOICE_CLEAR' });
      //      dispatch({ type: 'CREATE_SUCCESS' });
      //      localStorage.removeItem('orderItems');
      setIsPaying(false);
      setDesval('');
      setDesVal('');
      setRecNum('');
      setRecDat('');
      setNumval(' ');
      setAmountval(0);
      //navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  /////////////////////////////////////////////
  const Paying = () => {
    setIsPaying(!isPaying);
    if (isPaying) {
      setDesval('');
      setDesVal('');
      setRecNum('');
      setRecDat('');
      setNumval(' ');
      setAmountval(0);
    }
  };

  const unloadpayment = async () => {
    if (window.confirm('Are you fill all Dates?')) {
    }
  };

  const clearitems = () => {
    ctxDispatch({ type: 'INVOICE_CLEAR' });
    dispatch({ type: 'CREATE_SUCCESS' });
    localStorage.removeItem('orderItems');
    localStorage.removeItem('receiptItems');
    setShowInvoice(false);
  };

  return (
    <>
      <Helmet>
        <title>Sale Invoice</title>
      </Helmet>

      <main>
        {!showInvoice ? (
          <>
            {/* name, address, email, phone, bank name, bank account number, website client name, client address, invoice number, invoice date, due date, notes */}
            <div>
              <div className="bordeTable">
                <Row>
                  <Col md={4}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Customer Code</Form.Label>
                          <Form.Control
                            className="input"
                            placeholder="Customer Code"
                            value={codCus}
                            onChange={(e) => setCodCus(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>

                  <Col md={8}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Customer Name</Form.Label>
                          <Form.Select
                            className="input"
                            onClick={(e) => handleChange(e)}
                          >
                            {customers.map((elemento) => (
                              <option key={elemento._id} value={elemento._id}>
                                {elemento.nameCus}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>
                </Row>

                <Row>
                  <Col md={1}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Invoice N°</Form.Label>
                          <Form.Control
                            className="input"
                            placeholder="Invoice N°"
                            value={invNum}
                            onChange={(e) => setInvNum(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>

                  <Col md={2}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Invoice Date</Form.Label>
                          <Form.Control
                            className="input"
                            type="date"
                            placeholder="Invoice Date"
                            value={invDat}
                            onChange={(e) => setInvDat(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>
                  <Col md={2}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Due Date</Form.Label>
                          <Form.Control
                            className="input"
                            type="date"
                            placeholder="Due Date"
                            value={dueDat}
                            onChange={(e) => setDueDat(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>
                  <Col md={1}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Remit N°</Form.Label>
                          <Form.Control
                            className="input"
                            placeholder="Remit N°"
                            value={remNum}
                            onChange={(e) => setRemNum(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>
                  <Col md={6}>
                    <Card.Body>
                      <Card.Title>
                        <Form.Group className="input" controlId="name">
                          <Form.Label>Additional Notes</Form.Label>
                          <textarea
                            className="input"
                            placeholder="Additional notes to the client"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          ></textarea>
                        </Form.Group>
                      </Card.Title>
                    </Card.Body>
                  </Col>
                </Row>

                <div className="bordeTable">
                  <Row>
                    <Col md={2}>
                      <Card.Body>
                        <Card.Title>
                          <Form.Group className="input" controlId="name">
                            <Form.Label>Values</Form.Label>
                            <Form.Select
                              className="input"
                              onClick={(e) => handleValueChange(e)}
                              disabled={!isPaying}
                            >
                              {valuess.map((elementoV) => (
                                <option
                                  key={elementoV._id}
                                  value={elementoV._id}
                                >
                                  {elementoV.desVal}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Card.Title>
                      </Card.Body>
                    </Col>

                    <Col md={2}>
                      <Card.Body>
                        <Card.Title>
                          <Form.Group className="input" controlId="name">
                            <Form.Label>Value N°</Form.Label>
                            <Form.Control
                              className="input"
                              placeholder="Value N°"
                              value={numval}
                              onChange={(e) => setNumval(e.target.value)}
                              disabled={!isPaying}
                              required
                            />
                          </Form.Group>
                        </Card.Title>
                      </Card.Body>
                    </Col>
                    <Col md={3}>
                      <Card.Body>
                        <Card.Title>
                          <Form.Group className="input" controlId="name">
                            <Form.Label>Receipt Date</Form.Label>
                            <Form.Control
                              className="input"
                              type="date"
                              placeholder="Receipt Date"
                              value={recDat}
                              onChange={(e) => setRecDat(e.target.value)}
                              disabled={!isPaying}
                              required
                            />
                          </Form.Group>
                        </Card.Title>
                      </Card.Body>
                    </Col>

                    <Col md={2}>
                      <Card.Body>
                        <Card.Title>
                          <Form.Group className="input" controlId="name">
                            <Form.Label>Receipt N°</Form.Label>
                            <Form.Control
                              className="input"
                              placeholder="Receipt N°"
                              value={recNum}
                              onChange={(e) => setRecNum(e.target.value)}
                              disabled={!isPaying}
                              required
                            />
                          </Form.Group>
                        </Card.Title>
                      </Card.Body>
                    </Col>
                    <Col md={2}>
                      <div className="d-grid">
                        <Button
                          type="button"
                          onClick={Paying}
                          className="mt-3 mb-1 bg-yellow-300 text-black py-1 px-1 rounded shadow border-2 border-yellow-300 hover:bg-transparent hover:text-blue-500 transition-all duration-300"
                          disabled={
                            orderItems.length === 0 ||
                            !invNum ||
                            !invDat ||
                            !codCus
                          }
                        >
                          {isPaying ? 'Not Payment' : 'Load Payment'}
                        </Button>
                      </div>
                      {loading && <LoadingBox></LoadingBox>}
                    </Col>
                    <Col md={1}>
                      <div
                        className="d-grid mt-3 mb-1 py-1 px-1 transition-all
                        duration-300"
                      >
                        {isPaying && desval && recNum && recDat
                          ? 'Loaded'
                          : 'Not Loaded '}
                      </div>
                      {loading && <LoadingBox></LoadingBox>}
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="bordeTable">
                <div className="bordeTableinput">
                  <Row>
                    <Col md={4} sm={3} xs={12}>
                      <div className="d-grid">
                        <Button
                          type="button"
                          onClick={placeCancelInvoiceHandler}
                          disabled={
                            orderItems.length === 0 ||
                            !invNum ||
                            !invDat ||
                            !codCus
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                      {loading && <LoadingBox></LoadingBox>}
                    </Col>

                    <Col md={4} sm={3} xs={12}>
                      <div className="d-grid">
                        <Button
                          type="button"
                          onClick={placeInvoiceHandler}
                          disabled={
                            orderItems.length === 0 ||
                            !invNum ||
                            !invDat ||
                            !codCus
                          }
                        >
                          Save Invoice
                        </Button>
                      </div>
                      {loading && <LoadingBox></LoadingBox>}
                    </Col>

                    <Col md={4} sm={3} xs={12}>
                      <Card.Body>
                        <Card.Title>
                          <ListGroup.Item>
                            <h3>
                              Total: $
                              {amountval}
                            </h3>
                          </ListGroup.Item>
                        </Card.Title>
                      </Card.Body>
                    </Col>
                  </Row>
                </div>

                {/* This is our table form */}
                <article>
                  <TableForm
                    codPro={codPro}
                    setCodPro={setCodPro}
                    desPro={desPro}
                    setDesPro={setDesPro}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    price={price}
                    setPrice={setPrice}
                    amount={amount}
                    setAmount={setAmount}
                    list={list}
                    setList={setList}
                    total={total}
                    setTotal={setTotal}
                    valueeR={valueeR}
                    desval={desval}
                    numval={numval}
                    isPaying={isPaying}
                    //                    totInvwithTax={totInvwithTax}
                    //                    setTotInvwithTax={setTotInvwithTax}
                  />
                </article>
              </div>
            </div>
          </>
        ) : (
          <>
            <ReactToPrint
              trigger={() => <Button type="button">Print / Download</Button>}
              content={() => componentRef.current}
            />
            <Button onClick={() => clearitems()}>New Invoice</Button>

            {/* Invoice Preview */}

            <div ref={componentRef} className="p-5">
              <Header handlePrint={handlePrint} />

              <div className="container mt-4">
      <div className="card border-dark">
        <div className="card-header bg-dark text-white text-center"></div>
        <div className="card-body">
          
        <div className="card-header text-black text-center">FACTURA A</div>
          <div className="row">
            <div className="col-md-6">
              <p><strong>{userInfo.nameCon}</strong></p>
              <p><strong>Razon Social:</strong> {userInfo.nameCon}</p>
              <p><strong>Domicilio Comercial:</strong> {invoicegpt.client.address}</p>
              <p><strong>Condición frente al IVA:</strong> {invoicegpt.client.ivaCondition}</p>
            </div>
            <div className="col-md-6 ">
              <p><strong>FACTURA</strong></p>
              <p><strong>Punto de Venta:</strong> {invoicegpt.salePoint}    
              <strong>     Comp. Nro:</strong> {invoicegpt.invoiceNumber}</p>
              <p><strong>Fecha de Emision:</strong> {invoicegpt.date}</p>
              <p><strong>Cliente:</strong> {invoicegpt.client.name}</p>
              <p><strong>CUIT:</strong> {invoicegpt.client.cuit}</p>
            </div>
          </div>
                    <hr />
            <div className="row">
              <div className="col-md-6">
                <p><strong>CUIT:</strong> {invoicegpt.cuit}</p>
                <p><strong>Punto de Venta:</strong> {invoicegpt.salePoint}</p>
                <p><strong>N° Factura:</strong> {invoicegpt.invoiceNumber}</p>
                <p><strong>Fecha:</strong> {invoicegpt.date}</p>
              </div>
              <div className="col-md-6 text-md-end">
                <p><strong>Cliente:</strong> {invoicegpt.client.name}</p>
                <p><strong>CUIT:</strong> {invoicegpt.client.cuit}</p>
                <p><strong>Dirección:</strong> {invoicegpt.client.address}</p>
                <p><strong>Condición IVA:</strong> {invoicegpt.client.ivaCondition}</p>
              </div>
          </div>
          <table className="table table-bordered mt-3">
            <thead className="table-dark text-white">
              <tr>
                <th>#</th>
                <th>Descripción</th>
                <th className="text-end">Cantidad</th>
                <th className="text-end">Precio</th>
                <th className="text-end">IVA (%)</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.description}</td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">${item.price.toFixed(2)}</td>
                  <td className="text-end">{15}%</td>
                  <td className="text-end">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-end">


            {/* <p><strong>Subtotal:</strong> ${getTotal()}</p>
            <p><strong>IVA:</strong> ${getIVA()}</p> */}
            <h5><strong>Total:</strong> ${amountval}</h5>
        <p><strong>Subtotal:</strong> ${getTotal()}</p>
        <p><strong>IVA:</strong> ${getIVA()}</p>
        <h5><strong>Total:</strong> ${getTotalWithIVA()}</h5>


          </div>
        </div>
      </div>
    </div>



            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;
