import React from 'react';
import axios from "axios";
import configuration from "./configuration.js";
import state from "./state.js";
import Card from 'react-bootstrap/Card'
import ProgressBar from 'react-bootstrap/ProgressBar'

export default class ShuttleBooks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerName: "",
            customerEMail: "",
            books: []
        };
    }

    componentDidMount() {
        axios.get(configuration.url + "/products").then(response => {
            this.setState({
                books: response.data.data.map(function (book) {
                    book.buying = false;
                    return book;
                })
            });
        });
    }

    componentWillUnmount() {

    }

    toggle(book) {
        book.buying = !book.buying;
    }

    total() {
        return this.state.books.reduce(function (result, book) {
            return result + (book.buying ? book.price : 0);
        }, 0);
    }

    render() {
        if (!!this.state.books.length) {
            return (
                <div>
                    <h4>Available titles</h4>
                    <table className="table table-sm">
                        <thead className="thead-light">
                            <tr className="row">
                                <th className="col-1"></th>
                                <th className="col">Title</th>
                                <th className="col-2 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.books.map((book) => {
                                    return (
                                        <tr className={'row ' + (book.buying ? 'table-info' : '')} key={book.id}>
                                            <td className="col-1">
                                                {
                                                    book.buying
                                                        ? <button className="btn btn-default btn-danger btn-sm" onClick={() => this.remove(book)}>Remove</button>
                                                        : <button className="btn btn-default btn-success btn-sm" onClick={() => this.toggle(book)}>Add</button>
                                                }
                                            </td>
                                            <td className="col"><a href={book.url} target={"_blank"}>{book.description}</a></td>
                                            <td className="col-2 text-right">{book.price}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody >
                        <tfoot>
                            <tr className="row">
                                <td colSpan="2" className="col"></td>
                                <td className="col-2 text-right info">{this.total()}</td>
                            </tr>
                        </tfoot>
                    </table >
                </div >
            );
        } else {
            return (
                <Card>
                    <Card.Header>(fetching books)</Card.Header>
                    <Card.Body>
                        <ProgressBar now={100} striped animated className="mt-2" />
                    </Card.Body>
                </Card>
            )
        }
    }
}