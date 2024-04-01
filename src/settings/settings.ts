import {
	App,
	PluginSettingTab,
	Setting,
} from 'obsidian';

import NoteWidthSlider from "../main";
import { NoteWidthSliderSettings } from 'src/types/settings';

// ---------------------------- Storing Information ----------------------------
// the default value of the thing you want to store 
export const DEFAULT_SETTINGS: NoteWidthSliderSettings = {
	defaultNoteWidth: 47,
	sliderLength: 200
}
// ---------------------------- Storing Information ----------------------------

export class NoteWidthSliderSettingTab extends PluginSettingTab {
	plugin: NoteWidthSlider;

	constructor(app: App, plugin: NoteWidthSlider) {
		super(app, plugin);
		this.plugin = plugin;
	}
	// this.settings.sliderLength
	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Slider Length')
			.setDesc('The length in px of the slider in the status bar.')
			.addText(text => text
				.setPlaceholder('length in px')
				.setValue(this.plugin.settings.sliderLength.toString())
				.onChange(async (value) => {
					this.plugin.settings.sliderLength = +value;
					this.plugin.updateSliderLength();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Note Width')
			.setDesc('The default note width in px.')
			.addText(text => text
				.setPlaceholder('width in px')
				.setValue(this.plugin.settings.defaultNoteWidth.toString())
				.onChange(async (value) => {
					this.plugin.settings.defaultNoteWidth = +value;
					// this.plugin.updateSliderLength();
					await this.plugin.saveSettings();
				}));

	}
}