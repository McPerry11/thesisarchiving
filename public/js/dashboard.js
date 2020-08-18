$(function() {
	function responsiveViewport() {
		if (window.matchMedia('only screen and (max-width: 600px)').matches) {
			$('#header .title').addClass('is-4');
			$('#header .button').addClass('is-small');
			$('#header .button p').remove();
		} else {
			$('#header .title').removeClass('is-4');
			$('#header .button').removeClass('is-small');
			if (!$('#header .button p').length) $('#header .button').append('<p>Log Out</p>');
		}
	}

	function getStudentInfo(studentnums) {
		for (let i = 1; i < 6; i++) {
			if ($('#sname' + i).val() == '' || $('#snum' + i).val() == '') break;
			studentnums.push($('#snum' + i).val());
		}
		return studentnums;
	}

	function clearStatus() {
		$('button').removeAttr('disabled');
		$('select').removeAttr('disabled');
		$('input').removeAttr('readonly');
		$('textarea').removeAttr('readonly');
		$('.name').attr('readonly', true);
		$('#edit_user button.is-fullwidth').attr('disabled', true);
		if ($('#search input').val() == '') $('#clear').attr('disabled', true);
	}

	function ajaxError(err) {
		console.log(err);
		Swal.fire({
			icon: 'error',
			title: 'Cannot Connect to Server',
			text: 'Something went wrong. Please try again later.'
		});
	}

	function loadKeywords(keystring, area) {
		let tags = '<span class="tag is-dark">' + area + '</span>', keywords = keystring.split(',');
		for (let i in keywords) {
			tags += '<span class="tag">' + keywords[i] + '</span>';
		}
		return tags;
	}

	function loadNames(adviser, students) {
		let tags = '<span class="tag is-info">' + adviser + '</span>';
		for (let i in students) {
			tags += '<span class="tag is-info is-light">' + students[i].name + '</span>';
		}
		return tags;
	}

	function addRibbon(program) {
		let ribbon;
		switch(program) {
			case 'BSCS':
			ribbon = '<div class="ribbon is-success">BSCS</div>';
			break;

			case 'BSIT':
			ribbon = '<div class="ribbon is-info">BSIT</div>';
			break;

			case 'BSEMCDA':
			ribbon = '<div class="ribbon is-danger">BSEMC-DA</div>';
			break;

			case 'BSEMCGD':
			ribbon = '<div class="ribbon is-warning">BSEMC-GD</div>';
			break;

			case 'BSIS':
			ribbon = '<div class="ribbon is-primary">BSIS</div>';
			break;
		}
		return ribbon;
	}

	function formatDate(date) {
		let hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? 'pm' : 'am';
		hours %= 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		let strTime = hours + ':' + minutes + ' ' + ampm;
		return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' - ' + strTime;
	}

	function retrieveProposals() {
		$('#loading').removeClass('is-hidden');
		$('#contents .box').remove();
		$('.table-container').remove();
		$('.notif').remove();
		$('#contents .subtitle.is-5').remove();
		$.ajax({
			type: 'POST',
			url: 'titles',
			data: {data:'titles', search:search, tab:tab},
			datatype: 'JSON',
			success: function(data) {
				$('#contents').append('<div class="subtitle is-5">Results: ' + data.proposals.length + '</div>');
				if (data.proposals.length == 0) {
					$('#contents').append('<div class="has-text-centered notif"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">No existing proposals.</div></div>');
				} else {
					for (let i in data.proposals) {
						let proposal = '<a class="box has-ribbon" data-id="' + data.proposals[i].id + '">' + addRibbon(data.proposals[i].program);
						proposal += '<div class="columns"><div class="column">';
						proposal += '<h3 class="title is-4">' + data.proposals[i].title + '</h3>';
						if (data.proposals[i].registration_id) proposal += '<h4 class="subtitle is-5">' + data.proposals[i].registration_id + '</h4>';
						proposal += '<div class="tags">' + loadKeywords(data.proposals[i].keywords, data.proposals[i].area) + '</div>';
						if (data.proposals[i].students) proposal += '<div class="tags">' + loadNames(data.proposals[i].adviser, data.proposals[i].students) + '</div>';
						if (data.proposals[i].edit) {
							proposal += '</div><div class="column is-2-desktopn is-3-tablet">';
							proposal += '<div class="buttons is-right">';
							proposal += '<button class="button edit" data-id="' + data.proposals[i].id + '" title="Edit ' + data.proposals[i].registration_id + '"><span class="icon"><i class="fas fa-edit"></i></span></button>';
							proposal += '<button class="button is-danger is-inverted remove" data-id="' + data.proposals[i].id + '" title="Remove ' + data.proposals[i].registration_id + '"><span class="icon"><i class="fas fa-trash"></i></span></button>';
							proposal += '</div>';
						}
						proposal += '</div></div></a>';
						$('#contents').append(proposal);
					}
				}
				$('#loading').addClass('is-hidden');
				$('#search button').removeClass('is-loading');
			},
			error: function(err) {
				$('#loading').addClass('is-hidden');
				$('#search button').removeClass('is-loading');
				$('#contents').append('<div class="has-text-centered notif"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">Cannot retrieve proposals. Try again later.</div></div>');
				ajaxError(err);
			}
		});
	}

	function retrieveLogs() {
		$('#loading').removeClass('is-hidden');
		$('#contents .box').remove();
		$('.table-container').remove();
		$('.notif').remove();
		$('#contents .subtitle.is-5').remove();
		$.ajax({
			type: 'POST',
			url: 'logs',
			data: {search:search},
			datatype: 'JSON',
			success: function(data) {
				$('#search button').removeClass('is-loading');
				$('#loading').addClass('is-hidden');
				$('#contents').append('<div class="subtitle is-5">Results: ' + data.length + '</div>');
				$('#contents').append('<div id="logs_table" class="table-container"><table class="table is-fullwidth"><tr><th>Log ID</th><th>Description</th><th>Date & Time</th></tr></table></div>');
				if (data.length > 0) {
					for (i in data) {
						let timestamp = new Date(data[i].created_at);
						$('table').append('<tr><td>' + data[i].id + '</td><td>' + data[i].description + '</td><td>' + formatDate(timestamp) + '</td></tr>');
					}
				} else {
					$('table').append('<tr><td colspan="3" class="has-text-centered"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">No existing logs.</div></td></tr>');
				}
			},
			error: function(err) {
				$('#loading').addClass('is-hidden');
				$('#search button').removeClass('is-loading');
				$('#contents').append('<div class="has-text-centered notif"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">Cannot retrieve logs. Try again later.</div></div>');
				ajaxError(err);
			}
		});
	}

	function retrieveStudents() {
		$('#loading').removeClass('is-hidden');
		$('#contents .box').remove();
		$('.table-container').remove();
		$('.notif').remove();
		$('#contents .subtitle.is-5').remove();
		$.ajax({
			type: 'POST',
			url: 'users',
			data: {data:'students', search:search},
			datatype: 'JSON',
			success: function(data) {
				$('#search button').removeClass('is-loading');
				$('#loading').addClass('is-hidden');
				$('#contents').append('<div class="subtitle is-5">Results: ' + data.length + '</div>');
				$('#contents').append('<div id="stud_table" class="table-container"><table class="table is-fullwidth"><tr><th>Student Number</th><th>Name</th><th>Actions</th></tr></table></div>');
				if (data.length > 0) {
					for (i in data)
						$('table').append('<tr><td>●●●●●●●●●●●</td><td>' + data[i].name + '</td><td><div class="buttons is-right"><button class="button studedit" data-id="' + data[i].id + '" title="Edit ' + data[i].name + '"><span class="icon"><i class="fas fa-edit"></i></span></button><button class="button is-danger is-inverted studremove" data-id="' + data[i].id + '" title="Remove ' + data[i].name + '"><span class="icon"><i class="fas fa-trash"></i></span></button></div></td></tr>');
				} else {
					$('table').append('<tr><td colspan="3" class="has-text-centered"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">No students registered.</div></td></tr>');
				}
			},
			error: function(err) {
				$('#loading').addClass('is-hidden');
				$('#search button').removeClass('is-loading');
				$('#contents').append('<div class="has-text-centered notif"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">Cannot retrieve students. Try again later.</div></div>');
				ajaxError(err);
			}
		});
	}

	function retrieveAdvisers() {
		$('#loading').removeClass('is-hidden');
		$('#contents .box').remove();
		$('.table-container').remove();
		$('.notif').remove();
		$('#contents .subtitle.is-5').remove();
		$.ajax({
			type: 'POST',
			url: 'users',
			data: {data:'advisers', search:search},
			datatype: 'JSON',
			success: function(data) {
				$('#search button').removeClass('is-loading');
				$('#loading').addClass('is-hidden');
				$('#contents').append('<div class="subtitle is-5">Results: ' + data.length + '</div>');
				$('#contents').append('<div id="stud_table" class="table-container"><table class="table is-fullwidth"><tr><th>ID Number</th><th>Name</th><th>Actions</th></tr></table></div>');
				if (data.length > 0) {
					for (i in data)
						$('table').append('<tr><td>●●●●●●●</td><td>' + data[i].name + '</td><td><div class="buttons is-right"><button class="button studedit" data-id="' + data[i].id + '" title="Edit ' + data[i].name + '"><span class="icon"><i class="fas fa-edit"></i></span></button><button class="button is-danger is-inverted studremove" data-id="' + data[i].id + '" title="Remove ' + data[i].name + '"><span class="icon"><i class="fas fa-trash"></i></span></button></div></td></tr>');
				} else {
					$('table').append('<tr><td colspan="3" class="has-text-centered"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">No advisers registered.</div></td></tr>');
				}
			},
			error: function(err) {
				$('#loading').addClass('is-hidden');
				$('#search button').removeClass('is-loading');
				$('#contents').append('<div class="has-text-centered notif"><span class="icon"><i class="fas fa-exclamation-circle"></i></span><div class="subtitle is-6">Cannot retrieve advisers. Try again later.</div></div>');
				ajaxError(err);
			}
		});
	}

	function sn_proposalCheck() {
		for (let i in sn_error) {
			if (sn_error[i] == true) {
				$('#submit').attr('disabled', true);
				break;
			}
		}
	}

	$('.pageloader .title').text('Loading Dashboard');
	$('#thesis').addClass('is-active');
	$('#loading').removeClass('is-hidden');
	var updateId, dlfile, check, event = '', editsn, editid, search = '', tab = 'all';
	var sn_error = {snum1:false, snum2:false, snum3:false, snum4:false, snum5:false};
	retrieveProposals();
	BulmaTagsInput.attach('input[data-type="tags"], input[type="tags"]');
	responsiveViewport();
	$(window).resize(function() {
		responsiveViewport();
	});

	$('#add').click(function() {
		if ($('#loading').hasClass('is-hidden')) {
			if ($('#thesis').hasClass('is-active')) {
				$('#thesis_note').addClass('is-hidden');
				$('#edit .select').removeClass('is-hidden');
				$('#submit').removeAttr('disabled');
				$('.name').attr('readonly', true);
				$('input').removeClass('is-danger').removeClass('is-success');
				$('#title_control .help').remove();
				$('.file-cta').css('width', 'fit-content');
				$('#file input').val('');
				$('.file-name').text('No file uploaded');
				$('#adviser').empty();
				Swal.fire({
					html: '<span class="icon is-large"><i class="fas fa-spin fa-spinner fa-2x"></i></span>',
					showConfirmButton: false,
					allowOutsideClick: false,
					allowEscapeKey: false
				});
				$.ajax({
					type: 'POST',
					url: 'users/validate',
					data: {data:'advisers'},
					datatype: 'JSON',
					success: function(data) {
						if (data.length > 0) {
							for (i in data) {
								$('#adviser').append('<option value="' + data[i].id + '">' + data[i].name + '</option>')
							}
						} else {
							$('#adviser_select').addClass('is-hidden');
							$('#thesis_note').removeClass('is-hidden');
							$('#submit').attr('disabled', true);
						}
						$('#edit').addClass('is-active');
						$('html').addClass('is-clipped');
						$('#edit .modal-card-title').text('Add Proposal');
						$('.modal input').val('');
						$('textarea').val('');
						$('#program').val('BSCS');
						$('.si input').attr('required', true);
						$('#sname5').removeAttr('required');
						$('#snum5').removeAttr('required');
						$('.si').removeClass('is-hidden');
						$('#note').addClass('is-hidden');
						$('#submit').empty().append('<span class="icon"><i class="fas fa-plus"></i></span><span>Add</span>');
						document.getElementById('keywords').BulmaTagsInput().flush();
						Swal.close();
					},
					error: function(err) {
						ajaxError(err);
					}
				});
			} else if ($('#students').hasClass('is-active') || $('#advisers').hasClass('is-active')) {
				$('#edit_user .help').remove();
				$('#upload').removeClass('is-hidden');
				$('#edit_user .subtitle').removeClass('is-hidden');
				$('#sn').removeClass('is-danger').removeClass('is-success');
				$('#submit_user').removeAttr('disabled');
				$('#edit_user').addClass('is-active');
				$('html').addClass('is-clipped');
				if ($('#students').hasClass('is-active')) {
					$('#edit_user .modal-card-title').text('Add Student');
					$('#edit_user .subtitle').text('Add an Individual Student');
					$('#user_label').text('Student Number');
					$('#upload').removeClass('is-hidden');
					$('#sn_field').removeClass('is-hidden');
					$('#sn_field input').attr('required', true);
				} else {
					$('#edit_user .modal-card-title').text('Add Adviser');
					$('#edit_user .subtitle').text('Add an Individual Adviser');
					$('#user_label').text('ID Number');
					$('#upload').addClass('is-hidden');
					$('#sn_field').addClass('is-hidden');
					$('#sn_field input').removeAttr('required');
				}
				$('.modal input').val('');
				$('#submit_user').empty().append('<span class="icon"><i class="fas fa-plus"></i></span><span>Add</span>');
			}
		}
	});

	$('.delete').click(function() {
		if ($('#view').hasClass('is-active')) {
			$('#view').removeClass('is-active');
			$('html').removeClass('is-clipped');
		}
		if (!$('#submit').hasClass('is-loading') && !$('.control').hasClass('is-loading')) {
			$('#edit').removeClass('is-active');
			$('html').removeClass('is-clipped');
		}
		if (!$('#submit_user').hasClass('is-loading') && !$('.control').hasClass('is-loading')) {
			$('#edit_user').removeClass('is-active');
			$('html').removeClass('is-clipped');
		}
		$('#rnd_details').removeClass('is-active');
	});

	$('.cancel').click(function() {
		if (!$('#submit').hasClass('is-loading'))  {
			$('#edit').removeClass('is-active');
			$('html').removeClass('is-clipped');
		}
		if (!$('#submit_user').hasClass('is-loading') && !$('#sncontrol').hasClass('is-loading')) {
			$('#edit_user').removeClass('is-active');
			$('html').removeClass('is-clipped');
		}
	});

	$('#proposal').submit(function(e) {
		e.preventDefault();
		$('button').attr('disabled', true);
		$('select').attr('disabled', true);
		$('input').attr('readonly', true);
		$('textarea').attr('readonly', true);
		$('#submit').addClass('is-loading').removeAttr('disabled');
		var data = new FormData($(this)[0]);
		data.append('program', $('#program').val());
		data.append('title', $('#title').val());
		data.append('adviser_id', $('#adviser').val());
		data.append('overview', $('#overview').val());
		data.append('area', $('#area').val());
		data.append('created_at', $('#date').val());
		data.append('keywords', document.getElementById('keywords').BulmaTagsInput().value);
		data.append('file', $('#file input')[0].files[0]);
		if ($('#submit span:nth-child(2)').text() == 'Add') {
			var studentnums = [];
			data.append('numbers', getStudentInfo(studentnums));
			$.ajax({
				type: 'POST',
				url: 'titles/create',
				data: data,
				processData: false,
				contentType: false,
				datatype: 'JSON',
				success: function(response) {
					clearStatus();
					$('#submit').removeClass('is-loading');
					Swal.fire({
						icon: 'success',
						title: response.msg,
						showConfirmButton: false,
						timer: 2500
					}).then(function() {
						retrieveProposals();
						$('#edit').removeClass('is-active');
						$('html').removeClass('is-clipped');
					});
				},
				error: function(err) {
					clearStatus();
					$('#submit').removeClass('is-loading');
					ajaxError(err);
				}
			});
		} else {
			$.ajax({
				type: 'POST',
				url: 'titles/' + updateId + '/update',
				data: data,
				processData: false,
				contentType: false,
				datatype: 'JSON',
				success: function(response) {
					clearStatus();
					$('#submit').removeClass('is-loading');
					Swal.fire({
						icon: 'success',
						title: 'Update Successful',
						text: response.msg,
						showConfirmButton: false,
						timer: 2500
					}).then(function() {
						retrieveProposals();
						$('#edit').removeClass('is-active');
						$('html').removeClass('is-clipped');
					});
				},
				error: function(err) {
					clearStatus();
					$('#submit').removeClass('is-loading');
					ajaxError(err);
				}
			});
		}
	});

	$('#logout').submit(function() {
		$('.pageloader').addClass('is-active');
		$('.pageloader .title').text('Logging Out');
	});

	$('body').delegate('.remove', 'click', function() {
		var button = this;
		event = 'Remove';
		$(this).addClass('is-loading');
		Swal.fire({
			html: '<span class="icon is-large"><i class="fas fa-spin fa-spinner fa-2x"></i></span>',
			showConfirmButton: false,
			allowOutsideClick: false,
			allowEscapeKey: false
		});
		var id = $(this).data('id');
		$.ajax({
			type: 'POST',
			url: 'titles/' + id,
			datatype: 'JSON',
			success: function(data) {
				$(button).removeClass('is-loading');
				Swal.fire({
					icon: 'warning',
					title: 'Confirm Delete',
					text: 'Are you sure you want to delete ' + data.title + '?',
					confirmButtonText: 'Yes',
					showCancelButton: true,
					cancelButtonText: 'No',
				}).then((result) => {
					if (result.value) {
						Swal.fire({
							title: 'Deleting Proposal',
							html: '<span class="icon is-large"><i class="fas fa-spin fa-spinner fa-2x"></i></span>',
							showConfirmButton: false,
							allowOutsideClick: false,
							allowEscapeKey: false
						});
						$.ajax({
							type: 'POST',
							url: 'titles/' + id + '/delete',
							datatype: 'JSON',
							success: function(response) {
								if (response.status == 'success') {
									Swal.fire({
										icon: 'success',
										title: 'Delete Successful',
										showConfirmButton: false,
										timer: 2500,
									}).then(function() {
										retrieveProposals();
										event = '';
									});
								}
							},
							error: function(err) {
								ajaxError(err);
								event = '';
							}
						});
					}
				});
			},
			error: function(err) {
				ajaxError(err);
				event = '';
				$(button).removeClass('is-loading');
			}
		});
	});

	$('body').delegate('.edit', 'click', function() {
		var button = this;
		event = 'Edit';
		$(this).addClass('is-loading');
		Swal.fire({
			html: '<span class="icon is-large"><i class="fas fa-spin fa-spinner fa-2x"></i></span>',
			showConfirmButton: false,
			allowOutsideClick: false,
			allowEscapeKey: false
		});
		$('.si').addClass('is-hidden');
		$('#submit').removeAttr('disabled');
		$('.name').attr('readonly', true);
		$('.si input').removeAttr('required');
		$('#note').removeClass('is-hidden');
		updateId = $(this).data('id');
		$.ajax({
			type: 'POST',
			url: 'titles/' + updateId + '/edit',
			datatype: 'JSON',
			success: function(data) {
				event = '';
				let advisers = '', date = new Date(data.proposal.created_at);
				for (i in data.advisers)
					advisers += '<option value="' + data.advisers[i].id + '">' + data.advisers[i].name + '</option>'
				$('#program').val(data.proposal.program);
				$('#title').val(data.proposal.title);
				$('#area').val(data.proposal.area);
				$('#adviser').append(advisers).val(data.proposal.adviser_id);
				$('#overview').val(data.proposal.overview);
				date = date.getFullYear() + '-' + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-' + date.getDate();
				$('#date').val(date);
				if (data.proposal.keywords) document.getElementById('keywords').BulmaTagsInput().add(data.proposal.keywords);
				$('#edit .modal-card-title').text('Edit Proposal');
				$('.file-cta').css('width', '50px');
				$('.file-name').text(data.proposal.filename);
				$('#submit').empty().append('<span class="icon"><i class="fas fa-edit"></i></span><span>Update</span>');
				Swal.close();
				$('#edit').addClass('is-active');
				$('html').addClass('is-clipped');
				$(button).removeClass('is-loading');
			},
			error: function(err) {
				ajaxError(err);
				event = '';
				$(button).removeClass('is-loading');
			}
		});
	});

	$('body').delegate('#contents a.box', 'click', function() {
		if (event == '') {
			let id = $(this).data('id');
			$('#view .field-body').empty();
			$('#view .field').removeClass('is-hidden');
			Swal.fire({
				html: '<span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>',
				showConfirmButton: false,
				allowOutsideClick: false,
				allowEscapeKey: false
			});
			$.ajax({
				type: 'POST',
				url: 'titles/' + id,
				data: {data:'view'},
				datatype: 'JSON',
				success: function(data) {
					let sistring = keystring = '', keywords = data.proposal.keywords.split(',');
					for (let i in keywords)
						keystring += '<span class="tag is-info is-light">' + keywords[i] + '</span>';
					if (data.proposal.students) {
						for (let i in data.proposal.students)
							sistring += '<span class="tag is-info is-light">' + data.proposal.students[i].name + '</span>';
						$('#vsi').append('<div class="tags are-medium">' + sistring + '</div>');
						$('#vadviser').text(data.proposal.adviser);
					} else {
						$('#vsi-label').addClass('is-hidden');
						$('#vadviser-label').addClass('is-hidden');
					}
					let date = new Date(data.proposal.created_at);
					$('#vdate').text((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
					$('#vprogram').text(data.proposal.program);
					$('#vtitle').text(data.proposal.title);
					$('#varea').text(data.proposal.area);
					$('#vkeywords').append('<div class="tags are-medium">' + keystring + '</div>');
					$('#voverview').text(data.proposal.overview);
					if (data.proposal.filename) {
						dlfile = id;
						$('#vfile').append('<a title="Download approval form">' + data.proposal.filename + '</a>');
					}
					Swal.close();
					$('#view').addClass('is-active');
					$('html').addClass('is-clipped');
				},
				error: function(err) {
					ajaxError(err);
				}
			});
		}
	});

	$('#myp').click(function() {
		if (!$(this).hasClass('is-active')) {
			if ($('#loading').hasClass('is-hidden')) {
				$('.tabs li').removeClass('is-active');
				$(this).addClass('is-active');
				$('#search input').val('');
				tab = 'myp', search = '';
				retrieveProposals();
			}
		}
	});

	$('#thesis').click(function() {
		if (!$(this).hasClass('is-active')) {
			if ($('#loading').hasClass('is-hidden')) {
				$('.tabs li').removeClass('is-active');
				$(this).addClass('is-active');
				$('.column:nth-child(2)').removeClass('is-hidden');
				$('#add span:nth-child(2)').text('Add Proposal');
				$('#logout').removeClass('is-hidden');
				$('#search input').val('').attr('placeholder', 'Search title, keyword, or name...');
				$('#clear').attr('disabled', true);
				tab = 'all', search = '';
				retrieveProposals();
			}
		}
	});

	$('#logs').click(function() {
		if (!$(this).hasClass('is-active')) {
			if ($('#loading').hasClass('is-hidden')) {
				$('.tabs li').removeClass('is-active');
				$(this).addClass('is-active');
				$('.column:nth-child(2)').addClass('is-hidden');
				$('#logout').removeClass('is-hidden');
				$('#search input').val('').attr('placeholder', 'Search description, date, or time...');
				$('#clear').attr('disabled', true);
				search = '';
				retrieveLogs();
			}
		}
	});

	$('#students').click(function() {
		if (!$(this).hasClass('is-active')) {
			if ($('#loading').hasClass('is-hidden')) {
				$('.tabs li').removeClass('is-active');
				$(this).addClass('is-active');
				$('.column:nth-child(2)').removeClass('is-hidden');
				$('#add span:nth-child(2)').text('Add Student');
				$('#search input').val('').attr('placeholder', 'Search name or student number...');
				$('#clear').attr('disabled', true);
				search = '';
				retrieveStudents();
			}
		}
	});

	$('#advisers').click(function() {
		if (!$(this).hasClass('is-active')) {
			if ($('#loading').hasClass('is-hidden')) {
				$('.tabs li').removeClass('is-active');
				$(this).addClass('is-active');
				$('.column:nth-child(2)').removeClass('is-hidden');
				$('#add span:nth-child(2)').text('Add Adviser');
				$('#search input').val('').attr('placeholder', 'Search name or number...');
				$('#clear').attr('disabled', true);
				search = '';
				retrieveAdvisers();
			}
		}
	});

	$('#search input').keyup(function() {
		$(this).val() != '' ? $('#clear').removeAttr('disabled') : $('#clear').attr('disabled', true);
	});

	$('#search').submit(function(e) {
		e.preventDefault();
		if ($('#loading').hasClass('is-hidden')) {
			if (tab == 'myp') {
				$('#myp').removeClass('is-active');
				$('#thesis').addClass('is-active');
			}
			$('#search button[title="Search"]').addClass('is-loading');
			tab = 'all', search = $('#search input').val();
			if ($('#thesis').hasClass('is-active')) {
				retrieveProposals();
			} else if ($('#logs').hasClass('is-active')) {
				retrieveLogs();
			} else if ($('#students').hasClass('is-active')) {
				retrieveStudents();
			} else if ($('#advisers').hasClass('is-active')) {
				retrieveAdvisers();
			}
		}	
	});

	$('#clear').click(function() {
		if ($('#loading').hasClass('is-hidden')) {
			$('#search input').val('');
			$(this).attr('disabled', true);
			tab = 'all', search = '';
			if ($('#thesis').hasClass('is-active')) {
				retrieveProposals();
			} else if ($('#logs').hasClass('is-active')) {
				retrieveLogs();
			} else if ($('#students').hasClass('is-active')) {
				retrieveStudents();
			} else if ($('#advisers').hasClass('is-active')) {
				retrieveAdvisers();
			}
		}
	});

	$('#user_form').submit(function(e) {
		e.preventDefault();
		$('input').attr('readonly', true);
		$('button').attr('disabled', true);
		$('#submit_user').addClass('is-loading').removeAttr('disabled');
		var number = $('#sn').val(), name = $('#name').val(), user = $('#students').hasClass('is-active') ? 'STUDENT' : 'ADVISER';
		if ($('#submit_user span:nth-child(2)').text() == 'Add') {
			$.ajax({
				type: 'POST',
				url: 'users/create',
				data: {type:user, student_number:number, name:name},
				datatype: 'JSON',
				success: function(response) {
					clearStatus();
					$('#submit_user').removeClass('is-loading');
					Swal.fire({
						icon: 'success',
						title: response.msg,
						showConfirmButton: false,
						timer: 2500
					}).then(function() {
						$('#edit_user').removeClass('is-active');
						$('html').removeClass('is-clipped');
						$('#students').hasClass('is-active') ? retrieveStudents() : retrieveAdvisers();
					});
				},
				error: function(err) {
					clearStatus();
					$('#submit_user').removeClass('is-loading');
					ajaxError(err);
				}
			});
		} else {
			$.ajax({
				type: 'POST',
				url: 'users/' + editid + '/update',
				data: {type:user, name:name, student_number:number},
				datatype: 'JSON',
				success: function(response) {
					clearStatus();
					$('#submit_user').removeClass('is-loading');
					Swal.fire({
						icon: 'success',
						title: response.msg,
						showConfirmButton: false,
						timer: 2500
					}).then(function() {
						$('#edit_user').removeClass('is-active');
						$('html').removeClass('is-clipped');
						$('#students').hasClass('is-active') ? retrieveStudents() : retrieveAdvisers();
					});
				},
				error: function(err) {
					clearStatus();
					$('#submit_user').removeClass('is-loading');
					ajaxError(err);
				}
			});
		}
	});

	$('#sn').keyup(function() {
		if (!$('#sncontrol').hasClass('is-loading')) {
			$(this).removeClass('is-success').removeClass('is-danger');
			$('#edit_user .help').remove();
			$('#submit_user').removeAttr('disabled');
			if ($('#students').hasClass('is-active')) {
				if ($(this).val().length > 11) $(this).val($(this).val().slice(0, 11));
				if ($(this).val().length == 11) {
					$('#sncontrol').addClass('is-loading');
					$(this).attr('readonly', true);
					$('button').attr('disabled', true);
					let sn = $(this).val();
					$.ajax({
						type: 'POST',
						url: 'users/check',
						data: {student_number:sn, type:'STUDENT'},
						datatype: 'JSON',
						success: function(response) {
							$('#sncontrol').removeClass('is-loading');
							if (response.status == 'success') {
								clearStatus();
								$('#sn').addClass('is-success').removeAttr('readonly');
							} else {
								clearStatus();
								if (editsn != sn) {
									$('#sn').addClass('is-danger');
									$('#sncontrol').append('<div class="help is-danger">' + response.msg + '</div>')
									$('#submit_user').attr('disabled', true);
								} else {
									$('#sn').addClass('is-success').removeAttr('readonly');
								}
							}
						},
						error: function(err) {
							clearStatus();
							$('#sncontrol').removeClass('is-loading');
							$('#sn').removeAttr('disabled');
							ajaxError(err);
						}
					});
				}
			} else {
				if ($(this).val().length > 5) $(this).val($(this).val().slice(0, 5));
				if ($(this).val().length == 5) {
					$('#sncontrol').addClass('is-loading');
					$(this).attr('readonly', true);
					$('button').attr('disabled', true);
					let sn = $(this).val();
					$.ajax({
						type: 'POST',
						url: 'users/check',
						data: {student_number:sn, type:'ADVISER'},
						datatype: 'JSON',
						success: function(response) {
							$('#sncontrol').removeClass('is-loading');
							if (response.status == 'success') {
								clearStatus();
								$('#sn').addClass('is-success').removeAttr('readonly');
							} else {
								clearStatus();
								if (editsn != sn) {
									$('#sn').addClass('is-danger');
									$('#sncontrol').append('<div class="help is-danger">' + response.msg + '</div>')
									$('#submit_user').attr('disabled', true);
								} else {
									$('#sn').addClass('is-success').removeAttr('readonly');
								}
							}
						},
						error: function(err) {
							clearStatus();
							$('#sncontrol').removeClass('is-loading');
							$('#sn').removeAttr('disabled');
							ajaxError(err);
						}
					});
				}
			}
		}
	});

	$('body').delegate('.studedit', 'click', async function() {
		$('button').attr('disabled', true);
		$('input').attr('readonly', true);
		$('#upload').addClass('is-hidden');
		if ($('#students').hasClass('is-active')) {
			$('#sn_field').removeClass('is-hidden');
			$('#sn_field input').attr('required', true);
		} else {
			$('#sn_field').addClass('is-hidden');
			$('#sn_field input').removeAttr('required');
		}
		var id = $(this).data('id');
		editid = id;
		const {value: password} = await Swal.fire({
			title: 'Enter admin password',
			input: 'password',
			inputAttributes: {
				autocapitalize: 'off',
				autocorrect: 'off'
			}
		});
		if (password) {
			Swal.fire({
				html: '<span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>',
				showConfirmButton: false,
				allowOutsideClick: false,
				allowEscapeKey: false
			});
			$.ajax({
				type: 'POST',
				url: 'users/' + id,
				data: {password:password},
				datatype: 'JSON',
				success: function(data) {
					if (data.status == 'error') {
						Swal.fire({
							icon: 'warning',
							title: 'Unauthorized Access',
							text: data.msg
						});
					} else {
						editsn = data.student_number;
						$('#sn').val(data.student_number);
						$('#name').val(data.name);
						$('#edit_user .help').remove();
						$('#sn').removeClass('is-danger').removeClass('is-success');
						$('#edit_user .subtitle').addClass('is-hidden');
						if ($('#students').hasClass('is-active')) {
							$('#edit_user .modal-card-title').text('Edit Student');
							$('#user_label').text('Student Number');
						} else {
							$('#edit_user .modal-card-title').text('Edit Adviser');
							$('#user_label').text('ID Number');
						}
						$('#submit_user').empty().append('<span class="icon"><i class="fas fa-edit"></i></span><span>Update</span>');
						$('#edit_user').addClass('is-active');
						$('html').addClass('is-clipped');
						Swal.close();
					}
					clearStatus();
				},
				error: function(err) {
					ajaxError(err);
				}
			});
		} else {
			clearStatus();
		}
	});

	$('body').delegate('.studremove', 'click', function() {
		$('button').attr('disabled', true);
		$('input').attr('readonly', true);
		var id = $(this).data('id');
		Swal.fire({
			html: '<span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>',
			showConfirmButton: false,
			allowOutsideClick: false,
			allowEscapeKey: false
		});
		$.ajax({
			type: 'POST',
			url: 'users/' + id,
			datatype: 'JSOON',
			success: function(data) {
				clearStatus();
				Swal.fire({
					icon: 'warning',
					title: 'Confirm Delete',
					html: '<div>Are you sure you want to delete ' + data.name + ' (' + data.student_number + ')?<div><div class="help">Any proposals and logs related to this user will be permanently deleted.</div>',
					confirmButtonText: 'Yes',
					showCancelButton: true,
					cancelButtonText: 'No',
				}).then((result) => {
					if (result.value) {
						Swal.fire({
							title: 'Deleting User',
							html: '<span class="icon is-large"><i class="fas fa-spin fa-spinner fa-2x"></i></span>',
							showConfirmButton: false,
							allowOutsideClick: false,
							allowEscapeKey: false
						});
						$.ajax({
							type: 'POST',
							url: 'users/' + id + '/delete',
							datatype: 'JSON',
							success: function(response) {
								Swal.fire({
									icon: 'success',
									title: response.msg,
									showConfirmButton: false,
									timer: 2500
								}).then(function() {
									$('#students').hasClass('is-active') ? retrieveStudents() : retrieveAdvisers();
								});
							},
							error: function(err) {
								ajaxError(err);
							}
						});
					}
				});
			},
			error: function(err) {
				clearStatus();
				ajaxError(err);
			}
		});
	});

	$('.sn').keyup(function() {
		var id = $(this).attr('id');
		$(this).removeClass('is-danger');
		$('#' + id + '_name').removeClass('has-text-danger').val('');
		if ($(this).val().length > 11) $(this).val($(this).val().slice(0, 11));
		sn_error[id] = false;
		clearStatus();
		sn_proposalCheck();
		if ($(this).val().length == 11) {
			let sn = $(this).val();
			$('#' + id + '_control').addClass('is-loading');
			$('#' + id).attr('readonly', true);
			$('button').attr('disabled', true);
			$.ajax({
				type: 'POST',
				url: 'users/validate',
				data: {data:'students', student_number:sn},
				datatype: 'JSON',
				success: function(data) {
					if (data) {
						$('#' + id + '_name').val(data).removeClass('is-danger');
						sn_error[id] = false;
					} else {
						$('#' + id).addClass('is-danger');
						$('#' + id + '_name').val('Not registered.').addClass('has-text-danger');
						sn_error[id] = true;
					}
					clearStatus();
					sn_proposalCheck();
					$('#' + id + '_control').removeClass('is-loading');
				},
				error: function(err) {
					ajaxError(err);
					clearStatus();
					$('#' + id + '_control').removeClass('is-loading');
				}
			});
		}
	});

	$('#title').keyup(function() {
		$(this).removeClass('is-success').removeClass('is-danger');
		$('#title_control .help').remove();
		$('#submit').removeAttr('disabled');
	});

	$('#title').focusout(function() {
		$('#title_control').addClass('is-loading');
		$('button').attr('disabled', true);
		$(this).removeClass('is-success').removeClass('is-danger');
		$('#title_control .help').remove();
		var title = $(this).val();
		$.ajax({
			type: 'POST',
			url: 'titles',
			data: {data:'validate', title:title},
			datatype: 'JSON',
			success: function(response) {
				$('#title_control').removeClass('is-loading');
				clearStatus();
				if (response.status == 'validated') {
					$('#title').addClass('is-success');
				} else if (response.status == 'error') {
					$('#title').addClass('is-danger');
					$('#title_control').append('<div class="help is-danger">This title already exists</div>');
					$('#submit').attr('disabled', true);
				}
			},
			error: function(err) {
				$('#title_control').removeClass('is-loading');
				ajaxError(err);
				clearStatus();
			}
		});
	});

	$('.rnd').click(function() {
		$('#rnd_details').addClass('is-active');
	});

	$('#file').change(function(e) {
		if (e.target.files.length > 0) {
			$('.file-name').text(e.target.files[0].name);
			$('.file-cta').animate({
				width: '50px'
			});
		}
	});

	$('body').delegate('#vfile a', 'click', function() {
		window.open('/thesisb/public/titles/' + dlfile + '/attachment', '_blank');
		// window.open('/thesisb/titles/' + dlfile + '/attachment', '_blank');
	});
});
