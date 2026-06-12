"""OnyxAgent CLI entry point."""

import click
from cli import __version__
from cli.commands.skill import skill
from cli.commands.process import start, stop, restart, update, status, logs
from cli.commands.context import context
from cli.commands.install import install_browser
from cli.commands.knowledge import knowledge


HELP_TEXT = """Usage: onyx COMMAND [ARGS]...

  OnyxAgent CLI - Manage your OnyxAgent instance.

Commands:
  help     Show this message.
  version  Show the version.
  start    Start OnyxAgent.
  stop     Stop OnyxAgent.
  restart  Restart OnyxAgent.
  update   Update OnyxAgent and restart.
  status   Show OnyxAgent running status.
  logs     View OnyxAgent logs.
  skill    Manage OnyxAgent skills.
  knowledge  Manage knowledge base.
  install-browser  Install browser tool (Playwright + Chromium).

Tip: Memory index management lives in chat — send /memory status or
/memory rebuild-index to the running agent."""


class OnyxCLI(click.Group):

    def format_help(self, ctx, formatter):
        formatter.write(HELP_TEXT.strip())
        formatter.write("\n")

    def parse_args(self, ctx, args):
        if args and args[0] == 'help':
            click.echo(HELP_TEXT.strip())
            ctx.exit(0)
        return super().parse_args(ctx, args)


@click.group(cls=OnyxCLI, invoke_without_command=True, context_settings=dict(help_option_names=[]))
@click.pass_context
def main(ctx):
    """OnyxAgent CLI - Manage your OnyxAgent instance."""
    if ctx.invoked_subcommand is None:
        click.echo(HELP_TEXT.strip())


@main.command()
def version():
    """Show the version."""
    click.echo(f"onyx {__version__}")


@main.command(name='help')
@click.pass_context
def help_cmd(ctx):
    """Show this message."""
    click.echo(HELP_TEXT.strip())


main.add_command(skill)
main.add_command(start)
main.add_command(stop)
main.add_command(restart)
main.add_command(update)
main.add_command(status)
main.add_command(logs)
main.add_command(context)
main.add_command(knowledge)
main.add_command(install_browser)


if __name__ == '__main__':
    main()
