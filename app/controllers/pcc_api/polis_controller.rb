# frozen_string_literal: true
require "cgi"

class PccApi::PolisController < ::ApplicationController
  def comments
    conversation_id = params[:conversation_id]
    iframe_url = params[:iframe_url]
    xid = params[:xid]
    x_profile_image_url = params[:x_profile_image_url]
    x_name = params[:x_name]
    conversation_id = get_polis_id(iframe_url)
    participation =
      JSON.parse(participation_init(conversation_id, xid, x_profile_image_url, x_name))
    next_comment = participation["nextComment"].to_json

    render json: { next_comment: next_comment, conversation_id: conversation_id }
  end

  def vote_comment
    weight = params["weight"]
    vote = params["vote"]
    tid = params["tid"]
    pid = params["pid"]
    agid = params["agid"]
    conversation_id = params["conversationId"]
    xid = params["xid"]
    return res.status(400).send("xid is required") if (!xid)
    x_name = params["xName"]
    x_profile_image_url = params["xProfileImageUrl"]

    uri = URI("https://pol.is/api/v3/votes")
    res =
      Net::HTTP.post_form(
        uri,
        "weight" => weight,
        "vote" => vote,
        "tid" => tid,
        "pid" => pid,
        "agid" => agid,
        "conversation_id" => conversation_id,
        "xid" => xid,
        "x_name" => x_name,
        "x_profile_image_url" => x_profile_image_url,
      )
    puts res.body if res.is_a?(Net::HTTPSuccess)
    render json: res.body
  end

  private

  def encode_user_attributes_for_get(xid, x_profile_image_url, x_name)
    "&xid=#{CGI.escape(xid)}&x_profile_image_url=#{CGI.escape(x_profile_image_url)}&x_name=#{CGI.escape(x_name)}"
  end

  def participation_init(conversation_id, xid, x_profile_image_url, x_name)
    initial_url =
      "https://pol.is/api/v3/participationInit?conversation_id=#{conversation_id}&pid=mypid"
    initial_url += encode_user_attributes_for_get(xid, x_profile_image_url, x_name) if xid
    # if not xid, user is not logged, but can still see a statement
    uri = URI(initial_url)
    res = Net::HTTP.get_response(uri)
    puts res.body if res.is_a?(Net::HTTPSuccess)
    res.body
  end

  def get_comments(conversation_id)
    uri = URI("https://pol.is/api/v3/comments?conversation_id=#{conversation_id}")
    res = Net::HTTP.get_response(uri)
    puts res.body if res.is_a?(Net::HTTPSuccess)
    res.body
  end

  def get_polis_id(iframe_url)
    iframe = Net::HTTP.get_response(URI(iframe_url))
    iframe_redirect_url = iframe["location"]
    extract_id(iframe_redirect_url)
  end

  def extract_id(uri_string)
    uri = URI(uri_string)
    path = uri.path
    path.slice!(0) if path[0] == "/" # Remove leading slash if present
    path
  end
end
