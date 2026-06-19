#! /usr/bin/env zsh
# vim: ft=zsh: ts=3: sw=3: noet:

function print-help () {
	cat - <<\eos-help

./pnpm-scripts.zsh 
	* install
	* prune
	* update
	* audit
	* list
	* outdated
	* help

	++ other args

eos-help
}


function () {
	local bdir

	bdir=${(%):-'%x'}
	bdir=${bdir:a}
	bdir=${bdir:h}

	cd "${bdir}"
}


function __run () {
	unfunction __run

	local -a CMD theargs
	local    key

	key=${1:-}
	(( ${#} > 0 )) && shift

	theargs=( "${@}" )

	CMD=( pnpm "${key}" )

	case "${key}"; in
		install)
			CMD+=(
				--verbose
				--recursive
				--side-effects-cache
			)
			;;

		prune)
			CMD+=(
				--stream
				--use-stderr
				--verbose
			)
			;;

		update)
			CMD+=(
				--verbose
				--dev
				--recursive
				--stream
				--use-stderr
			)
			;;

		audit)
			CMD+=(
				--verbose
				--dev
				--fix
				--json
			)
			;;

		list)
			CMD+=(
				--verbose
				--dev
				--recursive
				--stream
				--use-stderr
			)
			;;

		outdated)
			CMD+=(
				--verbose
				--recursive
				--dev
				--stream
				--use-stderr
				--no-table
			)
			;;

		help)
			print-help
			return 0
			;;

		*)
			print -u2 - "El comando pnpm ${(qq)key} no esta configurado"
			print-help
			return 100
			;;
	esac

	CMD+=( "${(@)theargs}" )


	## RUN
	print -u2 - "${(@q-)CMD}"

	"${(@)CMD}"
}


## RUN
__run "${@}"

