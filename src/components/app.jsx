import { h, Component } from 'preact';
import style from './app.less';

import Popup from './popup/popup';
import Banner from './banner/banner';

export default class App extends Component {
	static defaultProps = {
		theme: {}
	};

	state = {
		store: this.props.store
	};

	onSave = () => {
		const { store, notify } = this.props;
		store.persist();
		notify('onSubmit');
		store.toggleConsentToolShowing(false);
	};


	updateState = (store) => {
		this.setState({ store });
	};

	componentWillMount() {
		const { store } = this.props;
		store.subscribe(this.updateState);
	}

	render(props, state) {

		const {
			store,
		} = state;
		const {
			theme,
		} = props;

		const {
			fontFamily
		} = theme;

		const {
			isModalShowing,
			isBannerShowing,
			toggleModalShowing,
			bannerMessage
		} = store;

		return (
			<div class={style.gdpr} style={{fontFamily}}>
				<Banner isShowing={isBannerShowing}
						isModalShowing={isModalShowing}
						onSave={this.onSave}
						onShowModal={toggleModalShowing}
						theme={theme}
						bannerMessage={bannerMessage}
				/>
				<Popup store={store}
					   onSave={this.onSave}
					   theme={theme}
				/>
			</div>
		);
	}
}
