import { 
	Plugin, TFile
} from "obsidian";


import {
	DEFAULT_SETTINGS,
	NoteWidthSliderSettingTab
} from "./settings/settings";

import { 
	NoteWidthSliderSettings 
} from "./types/settings";


import { 
	WarningModal 
} from "./modal/warning";

// ---------------------------- Plugin Class -----------------------------------
export default class NoteWidthSlider extends Plugin {
	settings: NoteWidthSliderSettings;

	// most important function, this gets executed everytime the plugin is first 
	// loaded, e.g. when obsidian starts, or when the user just installed the 
	// plugin
	async onload() {
		await this.loadSettings();
		
		this.addStyle();

		this.app.workspace.on("file-open", () => {
			this.updateNoteWidth(this.getFrontMatterNoteWidth());
		});

		this.createSlider();

		this.addSettingTab(new NoteWidthSliderSettingTab(this.app, this));

	}

	// async onLoadFile(file: TFile) {
		

	// }

	onunload() {
		// Reset the note width view to Obsidian default. 
		this.updateNoteWidth(this.settings.defaultNoteWidth);
	}
	
	// ---------------------------- SLIDER -------------------------------------
	createSlider() {

		// Create the slider element
		const slider = document.createElement("input");
		slider.classList.add("custom-note-width-slider");
		slider.id = "custom-note-width-slider";
		slider.type = "range";
		slider.min = "0";
		slider.max = "100";
		slider.value = this.settings.defaultNoteWidth.toString();
		// Adjust the width value as needed
		slider.style.width = this.settings.sliderLength + "px"; 
		
		// Add event listener to the slider
		slider.addEventListener("input", (event) => {
			const value = parseInt(slider.value);
			// const widthInPixels = 400 + value * 10;
			this.updateNoteWidth(value);
      		this.updateNoteFrontMatter(value);
			// Perform any actions based on the slider value
		});

		// Create the text element for displaying the slider value
		const sliderValueText = document.createElement("span");
		sliderValueText.textContent = slider.value;
		sliderValueText.classList.add("custom-note-width-slider-value");
		sliderValueText.id = "custom-note-width-slider-value";

		// Add the CSS properties to the span element
		sliderValueText.style.color = "#dadada";
		sliderValueText.style.padding = "8px 5px";
		// sliderValueText.style.display = "inline";
		sliderValueText.style.borderRadius = "18%";
		// sliderValueText.style.border = "0";
		// sliderValueText.style.margin = "0px 10px";
		// sliderValueText.style.background = "var(--interactive-accent)";
		// sliderValueText.style.fontSize = "13px";
		// sliderValueText.style.lineHeight = "50%";
		sliderValueText.style.lineHeight = "0%";
		// sliderValueText.style.width = "auto";
		// sliderValueText.style.height = "auto";
		// sliderValueText.style.boxSizing = "content-box";

		// Add a hover effect to change the background color to red
		// sliderValueText.style.transition = "background 0.3s"; // Add smooth transition
		sliderValueText.style.cursor = "pointer"; // Change cursor on hover
		sliderValueText.addEventListener("mouseenter", function() {
			sliderValueText.style.color = "#dadada";
      		sliderValueText.style.background = "#363636";
		});
		sliderValueText.addEventListener("mouseleave", function() {
			sliderValueText.style.color = "#b3b3b3";
      		sliderValueText.style.background = "#262626";
		});

		// Add a click event listener to the slider value text
		sliderValueText.addEventListener("click", () => {
			let value = this.settings.defaultNoteWidth;
			this.updateNoteWidth(value);
			this.updateNoteFrontMatter(value);
		});

		// Create the status bar item
		const statusBarItemEl = this.addStatusBarItem();
		// Append the slider to the status bar item
		statusBarItemEl.appendChild(slider);
		statusBarItemEl.appendChild(sliderValueText);
	}
	// ---------------------------- SLIDER -------------------------------------

	// add element that contains all of the styling elements we need
	addStyle() {
		// add a css block for our settings-dependent styles
		const css = document.createElement("style");
		css.id = "additional-editor-css";
		document.getElementsByTagName("head")[0].appendChild(css);

		// add the main class
		document.body.classList.add("additional-editor-css");

		// update the style with the settings-dependent styles
		// this.updateEditorStyle();
	}


	// Get the note width value from the active note's front matter
	getFrontMatterNoteWidth() {
		const file = this.app.workspace.getActiveFile();
		let value = this.settings.defaultNoteWidth;
		if (file && file.name) {
		  const metadata = app.metadataCache.getFileCache(file);
		  if (metadata && metadata.frontmatter) {
			try {
			  if (metadata.frontmatter["note-width"]) {
				if (this.validateString(metadata.frontmatter["note-width"])) {
				  value = metadata.frontmatter["note-width"];
				} else {
				  new WarningModal(this.app).open();
				  throw new Error("Editor width must be a number from 0 to 100.");
				}
			  }
			} catch (e) {
			  console.error("Error:", e.message);
			}
		  }
		}
		return value;
	  }

	// Update note width
	updateNoteWidth(width: number) {
    
		const styleElement = document.getElementById("additional-editor-css");
		
		if (!styleElement) {
		  throw "additional-editor-css element not found!";
		}
	
		styleElement.innerText = 
		`
		body {
			--file-line-width: ${width}vw !important;
		}
		`;
	
		this.updateSliderProgress(width);
		this.updateSliderText(width);
	  }

	// Update slider progress
	updateSliderProgress(width: number) {
		const slider = document.getElementById("custom-note-width-slider");
		if(slider)
			slider.value = width.toString();
	  }

	// Update slider text
	updateSliderText(width: number) {
		const sliderValue = document.getElementById("custom-note-width-slider-value");
		if(sliderValue)
			sliderValue.textContent = width.toString();
	  }

	// Update current active note's frontmatter note-width property
	updateNoteFrontMatter(width: number) {

		const file = this.app.workspace.getActiveFile();
		if(file) {
			if (!file.name) {
			console.log("getActiveFile() Failed!");
			return;
			}
			this.app.fileManager.processFrontMatter(file, (file => {
			file["note-width"] = width;
			}))
		}
	  }

	// update slider width (at the start, or as the result of a settings change)
	updateSliderLength() {
		const styleElements = document.getElementsByClassName("custom-note-width-slider");
		
		if (styleElements.length === 0) {
		  throw new Error("custom-note-width-slider-value element not found!");
		}
	
		const styleElement = styleElements[0];
		styleElement.style.width = this.settings.sliderLength + "px";
	  }
	
	pattern = /^(100(\.0+)?|\d{0,2}(\.\d+)?)$/;

	validateString(inputString: string): boolean {
		return this.pattern.test(inputString);
	}

	// Method to load settings
	async loadSettings() {
		this.settings = Object.assign(
			{}, 
			DEFAULT_SETTINGS, 
			await this.loadData()
		);
	}

	// Method to store settings
	async saveSettings() {
		await this.saveData(this.settings);
	}

}
// ---------------------------- Plugin Class -----------------------------------
