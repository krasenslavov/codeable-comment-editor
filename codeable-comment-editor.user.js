/** @format */

// ==UserScript==
// @name         Codeable Comment Editor
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Opens comment textarea in a new window for full-screen editing
// @author       Krasen Slavov
// @match        https://app.codeable.io/*
// @match        https://*.codeable.io/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
	"use strict";

	console.log("🖊️ Codeable Comment Editor: Script loaded!");

	// Store reference to the popup window
	let editorWindow = null;

	// ============================================
	// UTILITY FUNCTIONS
	// ============================================

	function findCommentTextarea() {
		// Try multiple selectors to find the comment textarea
		const selectors = [
			'textarea[name="description"]',
			'marked-textarea textarea',
			'.comment-area',
			'textarea[placeholder*="comment"]',
			'textarea[placeholder*="Enter your comments"]'
		];

		for (const selector of selectors) {
			const textarea = document.querySelector(selector);
			if (textarea) {
				console.log("🖊️ Found textarea with selector:", selector);
				return textarea;
			}
		}

		console.log("🖊️ Could not find textarea");
		return null;
	}

	function getPrivateMode() {
		// Check if the "Reply to experts only" tab is active
		const expertTab = document.querySelector('.tab.expert.active');
		return expertTab !== null;
	}

	function openEditorWindow(currentText, isPrivate) {
		// Close existing window if open
		if (editorWindow && !editorWindow.closed) {
			editorWindow.focus();
			return;
		}

		console.log("🖊️ Opening editor window...");

		// Create new window
		editorWindow = window.open('', 'CodeableCommentEditor', 'width=1200,height=800');

		if (!editorWindow) {
			alert('Please allow popups for this site to use the Comment Editor');
			return;
		}

		const modeClass = isPrivate ? 'mode-private' : 'mode-public';
		const modeText = isPrivate ? '🔒 Experts Only' : '👥 Reply to All';
		const textValue = (currentText || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		// Build the HTML for the editor window
		editorWindow.document.write('<!DOCTYPE html>');
		editorWindow.document.write('<html>');
		editorWindow.document.write('<head>');
		editorWindow.document.write('<meta charset="UTF-8">');
		editorWindow.document.write('<title>Codeable Comment Editor</title>');
		editorWindow.document.write('<style>');
		editorWindow.document.write('* { margin: 0; padding: 0; box-sizing: border-box; }');
		editorWindow.document.write('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #1e1e1e; color: #ffffff; height: 100vh; display: flex; flex-direction: column; }');
		editorWindow.document.write('.header { background: #2d2d2d; padding: 15px 20px; border-bottom: 2px solid #444; display: flex; justify-content: space-between; align-items: center; }');
		editorWindow.document.write('.header h1 { font-size: 20px; font-weight: 600; color: #66b3ff; }');
		editorWindow.document.write('.header-actions { display: flex; gap: 10px; }');
		editorWindow.document.write('.mode-indicator { padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 500; }');
		editorWindow.document.write('.mode-public { background: #2d5a2d; color: #8fd98f; }');
		editorWindow.document.write('.mode-private { background: #5a2d2d; color: #ff9999; }');
		editorWindow.document.write('.editor-container { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }');
		editorWindow.document.write('.editor-toolbar { background: #2d2d2d; padding: 10px 15px; border-radius: 8px 8px 0 0; border-bottom: 1px solid #444; display: flex; gap: 10px; flex-wrap: wrap; }');
		editorWindow.document.write('.toolbar-btn { padding: 8px 12px; background: #444; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.2s; }');
		editorWindow.document.write('.toolbar-btn:hover { background: #555; }');
		editorWindow.document.write('.toolbar-btn:active { background: #666; }');
		editorWindow.document.write('textarea { flex: 1; width: 100%; background: #2d2d2d; color: #ffffff; border: none; border-radius: 0 0 8px 8px; padding: 20px; font-family: Consolas, Monaco, "Courier New", monospace; font-size: 15px; line-height: 1.6; resize: none; outline: none; }');
		editorWindow.document.write('textarea::placeholder { color: #888; }');
		editorWindow.document.write('.footer { background: #2d2d2d; padding: 15px 20px; border-top: 2px solid #444; display: flex; justify-content: space-between; align-items: center; }');
		editorWindow.document.write('.char-count { font-size: 13px; color: #999; }');
		editorWindow.document.write('.char-count.warning { color: #ff9999; font-weight: 600; }');
		editorWindow.document.write('.footer-actions { display: flex; gap: 10px; }');
		editorWindow.document.write('.btn { padding: 12px 24px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }');
		editorWindow.document.write('.btn-primary { background: #0066cc; color: white; }');
		editorWindow.document.write('.btn-primary:hover { background: #0052a3; }');
		editorWindow.document.write('.btn-primary:active { background: #004080; }');
		editorWindow.document.write('.btn-secondary { background: #555; color: white; }');
		editorWindow.document.write('.btn-secondary:hover { background: #666; }');
		editorWindow.document.write('.btn-secondary:active { background: #777; }');
		editorWindow.document.write('.btn-danger { background: #8b3333; color: white; }');
		editorWindow.document.write('.btn-danger:hover { background: #a33c3c; }');
		editorWindow.document.write('.help-text { font-size: 12px; color: #888; margin-top: 5px; }');
		editorWindow.document.write('</style>');
		editorWindow.document.write('</head>');
		editorWindow.document.write('<body>');
		editorWindow.document.write('<div class="header">');
		editorWindow.document.write('<h1>📝 Comment Editor</h1>');
		editorWindow.document.write('<div class="header-actions">');
		editorWindow.document.write('<div class="mode-indicator ' + modeClass + '">' + modeText + '</div>');
		editorWindow.document.write('</div>');
		editorWindow.document.write('</div>');
		editorWindow.document.write('<div class="editor-container">');
		editorWindow.document.write('<div class="editor-toolbar">');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertMarkdown(\'**\', \'**\')" title="Bold"><strong>B</strong></button>');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertMarkdown(\'_\', \'_\')" title="Italic"><em>I</em></button>');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertMarkdown(\'`\', \'`\')" title="Code"><code>&lt;/&gt;</code></button>');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertList(\'- \')" title="Bullet List">• List</button>');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertList(\'1. \')" title="Numbered List">1. List</button>');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertLink()" title="Insert Link">🔗 Link</button>');
		editorWindow.document.write('<button class="toolbar-btn" onclick="insertMarkdown(\'\\n```\\n\', \'\\n```\\n\')" title="Code Block">Code Block</button>');
		editorWindow.document.write('</div>');
		editorWindow.document.write('<textarea id="commentEditor" placeholder="Enter your comments here... (Supports Markdown)"></textarea>');
		editorWindow.document.write('</div>');
		editorWindow.document.write('<div class="footer">');
		editorWindow.document.write('<div>');
		editorWindow.document.write('<div class="char-count" id="charCount">0 / 5000 characters</div>');
		editorWindow.document.write('<div class="help-text">Supports Markdown: **bold**, _italic_, [link](url), `code`, lists, etc.</div>');
		editorWindow.document.write('</div>');
		editorWindow.document.write('<div class="footer-actions">');
		editorWindow.document.write('<button class="btn btn-secondary" onclick="clearText()">Clear</button>');
		editorWindow.document.write('<button class="btn btn-danger" onclick="window.close()">Cancel</button>');
		editorWindow.document.write('<button class="btn btn-primary" onclick="applyText()">Apply & Close</button>');
		editorWindow.document.write('</div>');
		editorWindow.document.write('</div>');

		// JavaScript for the editor
		editorWindow.document.write('<script>');
		editorWindow.document.write('const textarea = document.getElementById("commentEditor");');
		editorWindow.document.write('const charCount = document.getElementById("charCount");');
		editorWindow.document.write('function updateCharCount() {');
		editorWindow.document.write('  const length = textarea.value.length;');
		editorWindow.document.write('  charCount.textContent = length + " / 5000 characters";');
		editorWindow.document.write('  if (length > 4500) { charCount.classList.add("warning"); } else { charCount.classList.remove("warning"); }');
		editorWindow.document.write('}');
		editorWindow.document.write('function insertMarkdown(before, after) {');
		editorWindow.document.write('  const start = textarea.selectionStart;');
		editorWindow.document.write('  const end = textarea.selectionEnd;');
		editorWindow.document.write('  const selectedText = textarea.value.substring(start, end);');
		editorWindow.document.write('  const replacement = before + (selectedText || "text") + after;');
		editorWindow.document.write('  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);');
		editorWindow.document.write('  if (selectedText) { textarea.selectionStart = start; textarea.selectionEnd = start + replacement.length; }');
		editorWindow.document.write('  else { const cursorPos = start + before.length; textarea.selectionStart = cursorPos; textarea.selectionEnd = cursorPos + 4; }');
		editorWindow.document.write('  textarea.focus(); updateCharCount();');
		editorWindow.document.write('}');
		editorWindow.document.write('function insertList(prefix) {');
		editorWindow.document.write('  const start = textarea.selectionStart;');
		editorWindow.document.write('  const end = textarea.selectionEnd;');
		editorWindow.document.write('  const selectedText = textarea.value.substring(start, end);');
		editorWindow.document.write('  let replacement;');
		editorWindow.document.write('  if (selectedText) { const lines = selectedText.split("\\n"); replacement = lines.map(line => line.trim() ? prefix + line : line).join("\\n"); }');
		editorWindow.document.write('  else { replacement = "\\n" + prefix + "Item 1\\n" + prefix + "Item 2\\n" + prefix + "Item 3"; }');
		editorWindow.document.write('  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);');
		editorWindow.document.write('  textarea.selectionStart = start; textarea.selectionEnd = start + replacement.length;');
		editorWindow.document.write('  textarea.focus(); updateCharCount();');
		editorWindow.document.write('}');
		editorWindow.document.write('function insertLink() {');
		editorWindow.document.write('  const url = prompt("Enter URL:", "https://");');
		editorWindow.document.write('  if (url) {');
		editorWindow.document.write('    const start = textarea.selectionStart;');
		editorWindow.document.write('    const end = textarea.selectionEnd;');
		editorWindow.document.write('    const selectedText = textarea.value.substring(start, end);');
		editorWindow.document.write('    const linkText = selectedText || "link text";');
		editorWindow.document.write('    const replacement = "[" + linkText + "](" + url + ")";');
		editorWindow.document.write('    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);');
		editorWindow.document.write('    textarea.selectionStart = start; textarea.selectionEnd = start + replacement.length;');
		editorWindow.document.write('    textarea.focus(); updateCharCount();');
		editorWindow.document.write('  }');
		editorWindow.document.write('}');
		editorWindow.document.write('function clearText() {');
		editorWindow.document.write('  if (confirm("Are you sure you want to clear all text?")) {');
		editorWindow.document.write('    textarea.value = ""; updateCharCount(); textarea.focus();');
		editorWindow.document.write('  }');
		editorWindow.document.write('}');
		editorWindow.document.write('function applyText() {');
		editorWindow.document.write('  const text = textarea.value;');
		editorWindow.document.write('  if (window.opener && !window.opener.closed) {');
		editorWindow.document.write('    window.opener.postMessage({ type: "CODEABLE_COMMENT_APPLY", text: text }, "*");');
		editorWindow.document.write('    window.close();');
		editorWindow.document.write('  } else { alert("Parent window is closed. Copy your text manually."); }');
		editorWindow.document.write('}');
		editorWindow.document.write('textarea.addEventListener("input", updateCharCount);');
		editorWindow.document.write('textarea.addEventListener("keydown", (e) => {');
		editorWindow.document.write('  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); applyText(); }');
		editorWindow.document.write('  if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); insertMarkdown("**", "**"); }');
		editorWindow.document.write('  if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); insertMarkdown("_", "_"); }');
		editorWindow.document.write('  if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); insertLink(); }');
		editorWindow.document.write('});');
		editorWindow.document.write('window.addEventListener("beforeunload", (e) => {');
		editorWindow.document.write('  if (textarea.value.trim().length > 0) { e.preventDefault(); e.returnValue = ""; }');
		editorWindow.document.write('});');
		editorWindow.document.write('textarea.focus(); updateCharCount();');
		editorWindow.document.write('<\/script>');
		editorWindow.document.write('</body>');
		editorWindow.document.write('</html>');
		editorWindow.document.close();

		// Set the initial value after document is loaded
		setTimeout(() => {
			if (editorWindow && !editorWindow.closed) {
				const editorTextarea = editorWindow.document.getElementById('commentEditor');
				if (editorTextarea) {
					editorTextarea.value = currentText || '';
					editorWindow.document.getElementById('charCount').textContent =
						(currentText ? currentText.length : 0) + ' / 5000 characters';
				}
			}
		}, 100);

		console.log("🖊️ Editor window opened successfully");
	}

	// ============================================
	// MESSAGE HANDLER
	// ============================================

	window.addEventListener('message', (event) => {
		if (event.data && event.data.type === 'CODEABLE_COMMENT_APPLY') {
			console.log("🖊️ Received text from editor window");
			const textarea = findCommentTextarea();
			if (textarea) {
				// Set the text value
				textarea.value = event.data.text;

				// Trigger input event so Angular picks up the change
				textarea.dispatchEvent(new Event('input', { bubbles: true }));
				textarea.dispatchEvent(new Event('change', { bubbles: true }));

				// Try to trigger Angular's ng-model update
				const ngEvent = new Event('input', { bubbles: true });
				textarea.dispatchEvent(ngEvent);

				// Focus the textarea
				textarea.focus();

				console.log('✅ Comment text applied successfully');
			} else {
				console.error('❌ Could not find comment textarea');
				alert('Could not find comment textarea. Please paste manually.');
			}
		}
	});

	// ============================================
	// UI CREATION
	// ============================================

	function createEditorButton() {
		console.log("🖊️ Looking for comment form...");

		// Wait for the comment form to be available
		const checkInterval = setInterval(() => {
			const toggleCommentForm = document.querySelector('.toggle-comment-form');
			const textarea = findCommentTextarea();

			console.log("🖊️ Checking... toggleCommentForm:", !!toggleCommentForm, "textarea:", !!textarea);

			if (toggleCommentForm && textarea) {
				clearInterval(checkInterval);
				console.log("🖊️ Found comment form and textarea!");

				// Check if button already exists
				if (document.getElementById('comment-editor-btn')) {
					console.log("🖊️ Button already exists, skipping");
					return;
				}

				// Create the button
				const button = document.createElement('button');
				button.id = 'comment-editor-btn';
				button.type = 'button';
				button.className = 'cdbl-button button-icon button-compact';
				button.innerHTML = '🖊️';
				button.title = 'Open Full Editor';
				button.style.cssText = `
					margin-left: 8px;
					background: #0066cc;
					color: white;
					border: none;
					border-radius: 4px;
					font-size: 16px;
					cursor: pointer;
					transition: all 0.2s;
					padding: 6px 10px;
				`;

				button.addEventListener('mouseenter', () => {
					button.style.background = '#0052a3';
					button.style.transform = 'scale(1.1)';
				});

				button.addEventListener('mouseleave', () => {
					button.style.background = '#0066cc';
					button.style.transform = 'scale(1)';
				});

				button.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					const currentText = textarea.value;
					const isPrivate = getPrivateMode();
					openEditorWindow(currentText, isPrivate);
				});

				// Find the comment-form__header-actions div
				const headerActions = toggleCommentForm.querySelector('.comment-form__header-actions');
				if (headerActions) {
					// Add button before the lock icon span
					const lockSpan = headerActions.querySelector('span');
					if (lockSpan) {
						headerActions.insertBefore(button, lockSpan);
					} else {
						headerActions.appendChild(button);
					}
					console.log('✅ Comment Editor button added to toggle-comment-form');
				} else {
					// Fallback: add to the end of toggle-comment-form
					toggleCommentForm.appendChild(button);
					console.log('✅ Comment Editor button added (fallback position)');
				}
			}
		}, 1000);

		// Stop checking after 30 seconds
		setTimeout(() => clearInterval(checkInterval), 30000);
	}

	// ============================================
	// INITIALIZATION
	// ============================================

	function init() {
		console.log("🖊️ Codeable Comment Editor: Initializing...");
		createEditorButton();

		// Re-check when navigating (for SPAs)
		let lastUrl = location.href;
		new MutationObserver(() => {
			const url = location.href;
			if (url !== lastUrl) {
				lastUrl = url;
				console.log("🖊️ URL changed, re-initializing...");
				setTimeout(createEditorButton, 1000);
			}
		}).observe(document, { subtree: true, childList: true });
	}

	// Start the script
	console.log("🖊️ Document ready state:", document.readyState);

	if (document.readyState === "loading") {
		console.log("🖊️ Waiting for DOMContentLoaded...");
		document.addEventListener("DOMContentLoaded", init);
	} else {
		console.log("🖊️ DOM already loaded, initializing now...");
		init();
	}

	// Fallback: Also try on window.load
	window.addEventListener("load", function () {
		if (!document.getElementById("comment-editor-btn")) {
			console.log("🖊️ Reinitializing after window load");
			init();
		}
	});
})();
