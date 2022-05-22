import { PureComponent } from 'react';
import DebuggerContext, { DebuggerContextValues } from '../DebuggerContext';
import PropTypes from 'prop-types';
import { AutoSizer, List } from 'react-virtualized';
import listeners from '../../utils/listeners.js';
import 'react-virtualized/styles.css';
import './FuncList.css';

class FuncList extends PureComponent {
	state = {
		connected: false,
		// Lots of functions can take a while...
		loading: true,
		rowHeight: null,
		functions: [],
		filter: '',
		filteredFunctions: [],
	};
	/**
	 * @type {DebuggerContextValues}
	 */
	context;
	listeners_;

	render() {
		const { filter } = this.state;
		return (
			<div className="FuncList">
				<input type="search" className="FuncList__search" value={filter} onChange={this.handleFilter} />
				{this.renderList()}
			</div>
		);
	}

	renderList() {
		const { filter, loading, rowHeight } = this.state;
		if (loading || !rowHeight) {
			return <div className="FuncList__loading">Loading...</div>;
		}

		return (
			<div className="FuncList__listing" onClick={this.handleClick}>
				<AutoSizer filter={filter}>{this.renderSizedList}</AutoSizer>
			</div>
		);
	}

	renderSizedList = ({ height, width }) => {
		const { filter, filteredFunctions, rowHeight } = this.state;
		return (
			<List
				height={height}
				rowHeight={rowHeight}
				rowRenderer={this.renderFunc}
				width={width}
				rowCount={filteredFunctions.length}
				filter={filter}
			/>
		);
	};

	renderFunc = ({ index, key, style }) => {
		const func = this.state.filteredFunctions[index];
		return (
			<div key={key + '-' + func.address} style={style}>
				<button type="button" data-address={func.address}>{func.name}</button>
			</div>
		);
	};

	componentDidMount() {
		this.listeners_ = listeners.listen({
			'connection.change': (connected) => this.setState({ connected }),
			'game.start': () => this.updateList(),
		});
		if (this.state.connected) {
			this.updateList();
		}
		if (!this.state.rowHeight) {
			setTimeout(() => this.measureHeight(), 0);
		}
	}

	componentWillUnmount() {
		listeners.forget(this.listeners_);
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.connected && this.state.connected) {
			this.updateList();
		}
		if (!this.state.rowHeight) {
			setTimeout(() => this.measureHeight(), 0);
		}
	}

	measureHeight() {
		const node = document.querySelector('.FuncList__loading');
		if (node) {
			const rowHeight = node.getBoundingClientRect().height;
			this.setState({ rowHeight });
		}
	}

	updateList() {
		if (!this.state.connected) {
			// This avoids a duplicate update during initial connect.
			return;
		}

		if (!this.state.loading && this.state.functions.length === 0) {
			this.setState({ loading: true });
		}

		this.context.ppsspp.send({
			event: 'hle.func.list',
		}).then(({ functions }) => {
			functions.sort((a, b) => a.name.localeCompare(b.name));
			this.setState(prevState => ({
				functions,
				filteredFunctions: this.applyFilter(functions, prevState.filter),
				loading: false,
			}));
		}, () => {
			this.setState({ functions: [], filteredFunctions: [], loading: false });
		});
	}

	applyFilter(functions, filter) {
		if (filter === '') {
			return functions;
		}
		const match = filter.toLowerCase();
		return functions.filter(func => func.name.toLowerCase().indexOf(match) !== -1);
	}

	handleFilter = (ev) => {
		const filter = ev.target.value;
		this.setState(prevState => ({
			filter,
			filteredFunctions: this.applyFilter(prevState.functions, filter),
		}));
	};

	handleClick = (ev) => {
		const { address } = ev.target.dataset;
		this.props.gotoDisasm(Number(address));
		ev.preventDefault();
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		let update = null;
		if (nextProps.started) {
			update = { ...update, connected: true };
		}
		if (!nextProps.started && prevState.functions.length) {
			update = { ...update, functions: [], filteredFunctions: [] };
		}
		return update;
	}
}

FuncList.propTypes = {
	started: PropTypes.bool,
	gotoDisasm: PropTypes.func.isRequired,
};

FuncList.contextType = DebuggerContext;

export default FuncList;
