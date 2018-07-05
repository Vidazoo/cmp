import { h, Component } from 'preact';
import style from './banner.less';
import Label from '../label/label';
import ChevronIcon from '../chevronicon/chevronicon';

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'banner'
	};
}

const PANEL_COLLECTED = 0;
const PANEL_PURPOSE = 1;

export default class Banner extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isExpanded: false,
			selectedPanelIndex: 0,
		};
	}

	handleInfo = (index) => () => {
		const {isExpanded, selectedPanelIndex} = this.state;
		this.setState({
			selectedPanelIndex: index,
			isExpanded: index !== selectedPanelIndex || !isExpanded
		});
	};

	handleWindowClick = e => {
		if (!this.bannerRef || !this.bannerRef.contains(e.target)) {
			this.props.onSave();
		}
	};

	handleLearnMore = () => {
		this.props.onShowModal(true);
	};

	render(props, state) {
		const {isShowing, onSave, theme, bannerMessage} = props;
		const {selectedPanelIndex, isExpanded} = state;
		const {
			primaryColor,
			secondaryColor,
			primaryTextColor,
			backgroundColor,
			textColor,
			textLightColor,
			textLinkColor,
		} = theme;

		return (
			<div
				ref={el => this.bannerRef = el}
				class={[style.banner, !isShowing ? style.hidden : ''].join(' ')}
				style={{
					boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)',
					backgroundColor: backgroundColor,
					color: textLightColor
				}}
			>
				<div class={style.content}>
					<div
						class={style.message}
						ref={el => this.messageRef = el}
					>
						<div class={style.info}>
							<div localizeKey='description' dangerouslySetInnerHTML={{__html: bannerMessage}} />
						</div>
						<div class={style.consent}>
							<a class={style.learnMore} onClick={this.handleLearnMore}
							   style={{color: secondaryColor, borderColor: secondaryColor}}>
								<LocalLabel localizeKey='links.manage'>Learn More</LocalLabel>
							</a>
							<a
								class={style.continue}
								onClick={onSave}
								style={{
									backgroundColor: primaryColor,
									borderColor: primaryColor,
									color: primaryTextColor
								}}
							>
								<LocalLabel localizeKey='links.accept'>Continue to site</LocalLabel>
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
