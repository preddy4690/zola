import { AgentDetail } from "@/app/components/agents/agent-detail"
import { LayoutApp } from "@/app/components/layout/layout-app"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function AgentIdPage({
  params,
}: {
  params: Promise<{ agentSlug: string | string[] }>
}): Promise<JSX.Element> {
  const { agentSlug: slugParts } = await params
  const agentSlug = Array.isArray(slugParts) ? slugParts.join("/") : slugParts

  // Check if the slug looks like a static file (has a file extension)
  if (agentSlug.includes('.')) {
    // This is a static file request, not an agent slug
    // Return 404 without querying the database
    notFound()
  }

  const supabase = await createClient()

  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("slug", agentSlug)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!agent) {
    notFound()
  }

  const { data: agents, error: agentsError } = await supabase
    .from("agents")
    .select("*")
    .not("slug", "eq", agentSlug)
    .limit(4)

  if (agentsError) {
    throw new Error(agentsError.message)
  }

  return (
    <MessagesProvider>
      <LayoutApp>
        <div className="bg-background mx-auto max-w-3xl pt-20">
          <AgentDetail
            id={agent.id}
            slug={agent.slug}
            name={agent.name}
            description={agent.description}
            example_inputs={agent.example_inputs || []}
            creator_id={agent.creator_id}
            avatar_url={agent.avatar_url}
            randomAgents={agents || []}
            isFullPage
          />
        </div>
      </LayoutApp>
    </MessagesProvider>
  )
}
